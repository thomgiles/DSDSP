#!/usr/bin/env python3
"""Build homepage course and module data from the Quarto source tree."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
COURSES_ROOT = ROOT / "courses"
OUTPUT = ROOT / "html" / "landing-site-data.html"

COURSE_ORDER = {
    "essential_digital_skills": 1,
    "methods_for_data_science": 2,
    "responsible_use_of_generative_ai": 3,
    "automating_business_processes": 4,
    "applied_python": 5,
    "applied_R": 6,
}

COURSE_FRONTMATTER_KEYS = {
    "area": ("course-area", "area"),
    "level": ("course-level", "level"),
    "status": ("course-status", "status"),
    "badge": ("course-badge", "badge"),
    "summary": ("course-summary", "summary"),
    "icon": ("course-icon", "icon"),
}

COURSE_TAG_KEYS = ("course-tags", "tags")


def read_frontmatter_value(path: Path, key: str) -> str | None:
    text = path.read_text(encoding="utf-8", errors="ignore")
    if not text.startswith("---"):
        return None

    end = text.find("\n---", 3)
    if end == -1:
        return None

    frontmatter = text[3:end]
    pattern = re.compile(rf"^\s*{re.escape(key)}\s*:\s*(.+?)\s*$", re.MULTILINE)
    match = pattern.search(frontmatter)
    if not match:
        return None

    value = match.group(1).strip()
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        value = value[1:-1]
    return value.strip()


def read_frontmatter_list(path: Path, keys: tuple[str, ...]) -> list[str]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    if not text.startswith("---"):
        return []

    end = text.find("\n---", 3)
    if end == -1:
        return []

    frontmatter = text[3:end]
    for key in keys:
        inline = re.search(rf"^\s*{re.escape(key)}\s*:\s*\[(.*?)\]\s*$", frontmatter, re.MULTILINE)
        if inline:
            return [
                item.strip().strip("\"'")
                for item in inline.group(1).split(",")
                if item.strip()
            ]

        block = re.search(
            rf"^\s*{re.escape(key)}\s*:\s*\n(?P<body>(?:\s+-\s+.+\n?)+)",
            frontmatter,
            re.MULTILINE,
        )
        if block:
            return [
                item.strip().strip("\"'")
                for item in re.findall(r"^\s+-\s+(.+?)\s*$", block.group("body"), re.MULTILINE)
                if item.strip()
            ]

    return []


def strip_frontmatter(text: str) -> str:
    if not text.startswith("---"):
        return text

    end = text.find("\n---", 3)
    if end == -1:
        return text
    return text[end + 4 :].strip()


def clean_inline_markdown(value: str) -> str:
    value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"\1", value)
    value = re.sub(r"\*([^*]+)\*", r"\1", value)
    value = value.replace("`", "")
    return value.strip()


def course_intro(path: Path) -> str:
    text = strip_frontmatter(path.read_text(encoding="utf-8", errors="ignore"))
    section_match = re.search(
        r"##\s+Why This Course Matters\s+(?P<body>.*?)(?:\n##\s+|\Z)",
        text,
        flags=re.DOTALL,
    )
    if section_match:
        text = section_match.group("body")

    lines = text.splitlines()
    paragraph: list[str] = []
    in_fenced_div = False
    in_code_block = False

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue
        if stripped.startswith("<"):
            continue
        if stripped.startswith(":::"):
            in_fenced_div = not in_fenced_div
            if paragraph:
                break
            continue
        if not stripped or stripped.startswith("#"):
            if paragraph:
                break
            continue
        if stripped.startswith("- ") or stripped.startswith("1. "):
            continue
        paragraph.append(stripped)

    return clean_inline_markdown(" ".join(paragraph))


def course_glance_items(path: Path) -> list[str]:
    text = strip_frontmatter(path.read_text(encoding="utf-8", errors="ignore"))
    match = re.search(
        r":::\s*\{\.tier-card\}(?P<body>.*?):::",
        text,
        flags=re.DOTALL,
    )
    if not match:
        return []

    items: list[str] = []
    for line in match.group("body").splitlines():
        stripped = line.strip()
        if not stripped.startswith("- "):
            continue
        items.append(clean_inline_markdown(stripped[2:]))
    return items


def course_glance_map(items: list[str]) -> dict[str, str]:
    values: dict[str, str] = {}
    for item in items:
        if ":" not in item:
            continue
        key, value = item.split(":", 1)
        values[key.strip().lower()] = value.strip()
    return values


def read_course_metadata(path: Path, glance: dict[str, str]) -> dict[str, str]:
    metadata: dict[str, str] = {}
    for field, keys in COURSE_FRONTMATTER_KEYS.items():
        for key in keys:
            value = read_frontmatter_value(path, key)
            if value:
                metadata[field] = value
                break

    metadata.setdefault("level", glance.get("level", "Available"))
    metadata.setdefault("status", "Available")
    metadata.setdefault(
        "badge",
        glance.get("duration")
        or glance.get("environment")
        or glance.get("format")
        or "Course",
    )
    metadata.setdefault("summary", glance.get("main themes", ""))
    metadata.setdefault("area", metadata["badge"] if metadata["badge"] != "Course" else "Course")
    metadata.setdefault("icon", "📚")
    return metadata


def title_from_filename(path: Path) -> str:
    stem = re.sub(r"^\d+[-_]", "", path.stem)
    stem = stem.replace("_", " ").replace("-", " ")
    return stem.title()


def module_number(path: Path) -> str:
    match = re.match(r"^(\d+)", path.stem)
    return match.group(1) if match else ""


def build_data() -> dict[str, list[dict[str, str]]]:
    courses: list[dict[str, str]] = []
    modules: list[dict[str, str]] = []

    course_dirs = sorted(
        [path for path in COURSES_ROOT.iterdir() if path.is_dir()],
        key=lambda path: (COURSE_ORDER.get(path.name, 999), path.name.lower()),
    )

    for course_dir in course_dirs:
        if not course_dir.is_dir():
            continue
        if course_dir.name.startswith((".", "_")):
            continue

        index = course_dir / "index.qmd"
        episodes = course_dir / "episodes"
        if not index.exists() or not episodes.exists():
            continue

        title = read_frontmatter_value(index, "title") or title_from_filename(course_dir)
        subtitle = read_frontmatter_value(index, "subtitle") or ""
        intro = course_intro(index)
        glance = course_glance_items(index)
        meta = read_course_metadata(index, course_glance_map(glance))
        tags = read_frontmatter_list(index, COURSE_TAG_KEYS)
        course = {
            "slug": course_dir.name,
            "title": title,
            "subtitle": subtitle,
            "href": f"courses/{course_dir.name}/index.html",
            "area": meta["area"],
            "level": meta["level"],
            "status": meta["status"],
            "badge": meta["badge"],
            "summary": meta["summary"] or subtitle,
            "intro": intro or subtitle or meta.get("summary", ""),
            "glance": glance,
            "tags": tags,
            "icon": meta["icon"],
        }
        courses.append(course)

        for episode in sorted(episodes.glob("*.qmd")):
            if episode.name.startswith("_"):
                continue
            number = module_number(episode)
            module_title = read_frontmatter_value(episode, "title") or title_from_filename(episode)
            module_icon = read_frontmatter_value(episode, "module-icon") or course["icon"]
            modules.append(
                {
                    "title": module_title,
                    "href": f"courses/{course_dir.name}/episodes/{episode.with_suffix('.html').name}",
                    "course": title,
                    "courseSlug": course_dir.name,
                    "area": course["area"],
                    "level": course["level"],
                    "status": course["status"],
                    "badge": course["badge"],
                    "number": number,
                    "tags": tags,
                    "icon": module_icon,
                }
            )

    return {"courses": courses, "modules": modules}


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    data = json.dumps(build_data(), ensure_ascii=False, indent=2)
    data = data.replace("</", "<\\/")
    OUTPUT.write_text(
        f'<script type="application/json" id="landing-site-data">\n{data}\n</script>\n',
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
