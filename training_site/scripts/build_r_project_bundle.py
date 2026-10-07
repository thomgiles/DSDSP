"""Package the checked Applied R teaching project without generated files."""

from pathlib import Path
import os
import tempfile
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


PROJECT = Path(__file__).resolve().parents[1] / "courses/applied_R/learners/files/research-project"
FILES = ("README.md", "analysis.R", "app.R", "report.qmd", "tests.R", "data/gapminder_data.csv")


def build_bundle(project: Path, destination: Path) -> None:
    """Create a reproducible archive from the explicitly listed source files."""
    contents = [(name, (project / name).read_bytes()) for name in FILES]
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=destination.parent, suffix=".zip", delete=False) as file:
        temporary = Path(file.name)
    try:
        with ZipFile(temporary, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
            for name, content in contents:
                # Stable metadata keeps rebuilds independent of the host and time.
                entry = ZipInfo("research-project/" + name, date_time=(1980, 1, 1, 0, 0, 0))
                entry.compress_type = ZIP_DEFLATED
                entry.create_system = 3
                entry.external_attr = 0o100644 << 16
                archive.writestr(entry, content)
        if destination.exists() and destination.read_bytes() == temporary.read_bytes():
            return
        os.replace(temporary, destination)
    finally:
        temporary.unlink(missing_ok=True)


if __name__ == "__main__":
    build_bundle(PROJECT, PROJECT.with_suffix(".zip"))
