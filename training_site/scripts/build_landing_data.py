#!/usr/bin/env python3
"""Build homepage course and module data from the Quarto source tree."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "_includes" / "landing-site-data.html"

COURSE_META = {
    "essential_digital_skills": {
        "area": "Foundation",
        "level": "Foundation",
        "status": "Core",
        "badge": "Oct to Jan",
        "summary": "Core tools, data handling, evidence, insight, and impact.",
    },
    "responsible_use_of_generative_ai": {
        "area": "Responsible AI",
        "level": "Foundation",
        "status": "Core",
        "badge": "Extension",
        "summary": "Prompting, checking, critique, and responsible AI decisions.",
    },
    "automating_business_processes": {
        "area": "Automation",
        "level": "Intermediate",
        "status": "New",
        "badge": "Power Automate",
        "summary": "Power Automate workflows, approvals, Excel tables, and template emails.",
    },
    "applied_python": {
        "area": "Data Science",
        "level": "Intermediate",
        "status": "Optional",
        "badge": "Python",
        "summary": "Python for analysis, modelling, reporting, and debugging.",
    },
    "applied_R": {
        "area": "Data Science",
        "level": "Intermediate",
        "status": "Optional",
        "badge": "R",
        "summary": "R and tidyverse workflows for applied analysis.",
    },
}

COURSE_ORDER = {
    "essential_digital_skills": 1,
    "responsible_use_of_generative_ai": 2,
    "automating_business_processes": 3,
    "applied_python": 4,
    "applied_R": 5,
}


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

    for line in lines:
        stripped = line.strip()
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
        [path for path in ROOT.iterdir() if path.is_dir()],
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

        meta = COURSE_META.get(course_dir.name, {})
        title = read_frontmatter_value(index, "title") or title_from_filename(course_dir)
        subtitle = read_frontmatter_value(index, "subtitle") or meta.get("summary", "")
        intro = course_intro(index)
        glance = course_glance_items(index)
        course = {
            "slug": course_dir.name,
            "title": title,
            "subtitle": subtitle,
            "href": f"{course_dir.name}/index.html",
            "area": meta.get("area", "Other"),
            "level": meta.get("level", "Other"),
            "status": meta.get("status", "Available"),
            "badge": meta.get("badge", "Course"),
            "summary": meta.get("summary", subtitle),
            "intro": intro or subtitle or meta.get("summary", ""),
            "glance": glance,
        }
        courses.append(course)

        for episode in sorted(episodes.glob("*.qmd")):
            if episode.name.startswith("_"):
                continue
            number = module_number(episode)
            module_title = read_frontmatter_value(episode, "title") or title_from_filename(episode)
            modules.append(
                {
                    "title": module_title,
                    "href": f"{course_dir.name}/episodes/{episode.with_suffix('.html').name}",
                    "course": title,
                    "courseSlug": course_dir.name,
                    "area": course["area"],
                    "level": course["level"],
                    "status": course["status"],
                    "badge": course["badge"],
                    "number": number,
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
