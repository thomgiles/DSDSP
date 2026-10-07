"""Check the teaching archive's reproducibility and explicit contents."""

from pathlib import Path
import tempfile
import unittest
from zipfile import ZipFile

from build_r_project_bundle import FILES, build_bundle


class ResearchProjectBundleTest(unittest.TestCase):
    def test_rebuilds_are_identical_and_do_not_include_other_files(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            project = root / "project"
            for name in FILES:
                path = project / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(name, encoding="utf-8")
            (project / "unlisted.txt").write_text("Excluded fixture", encoding="utf-8")
            destination = root / "project.zip"
            build_bundle(project, destination)
            first = destination.read_bytes()
            build_bundle(project, destination)
            self.assertEqual(first, destination.read_bytes())
            with ZipFile(destination) as archive:
                self.assertEqual(archive.namelist(), ["research-project/" + name for name in FILES])
                for name in FILES:
                    self.assertEqual(archive.read("research-project/" + name), (project / name).read_bytes())
            (project / "analysis.R").write_text("Updated fixture", encoding="utf-8")
            build_bundle(project, destination)
            self.assertNotEqual(first, destination.read_bytes())

    def test_missing_sources_do_not_replace_an_existing_archive(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            destination = root / "project.zip"
            destination.write_bytes(b"Existing fixture")
            with self.assertRaises(FileNotFoundError):
                build_bundle(root / "missing", destination)
            self.assertEqual(destination.read_bytes(), b"Existing fixture")


if __name__ == "__main__":
    unittest.main()
