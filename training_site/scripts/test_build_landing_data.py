"""Check that the course finder handles visible and compatibility episodes."""

from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import build_landing_data


class CourseModulesTest(unittest.TestCase):
    def setUp(self) -> None:
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.courses_root = Path(self.directory.name)
        course = self.courses_root / "applied_R"
        self.episodes = course / "episodes"
        self.episodes.mkdir(parents=True)
        (course / "index.qmd").write_text(
            '---\ntitle: "Applied R"\n---\n\nAn R course.\n', encoding="utf-8"
        )
        self.root_patch = patch.object(
            build_landing_data, "COURSES_ROOT", self.courses_root
        )
        self.root_patch.start()
        self.addCleanup(self.root_patch.stop)

    def episode(self, filename: str, metadata: str = "") -> Path:
        path = self.episodes / filename
        path.write_text(
            f'---\ntitle: "{path.stem}"\n{metadata}---\n\nLesson content.\n',
            encoding="utf-8",
        )
        return path

    def test_compatibility_page_is_available_but_not_a_fifth_session(self) -> None:
        self.episode("01-foundations.qmd", 'module-number: "1"\n')
        legacy = self.episode("02-variables.qmd", "module-hidden: true\n")
        for number, filename in [(2, "03-functions.qmd"), (3, "04-loops.qmd"), (4, "05-data.qmd")]:
            self.episode(filename, f'module-number: "{number}"\n')

        data = build_landing_data.build_data()

        self.assertEqual(len(data["courses"]), 1)
        self.assertEqual(len(data["modules"]), 4)
        self.assertEqual([item["number"] for item in data["modules"]], ["1", "2", "3", "4"])
        self.assertTrue(legacy.is_file())
        self.assertNotIn(
            "courses/applied_R/episodes/02-variables.html",
            [item["href"] for item in data["modules"]],
        )

    def test_explicit_number_preserves_the_existing_url(self) -> None:
        self.episode("03-functions.qmd", 'module-number: "2"\n')

        module = build_landing_data.build_data()["modules"][0]

        self.assertEqual(module["number"], "2")
        self.assertEqual(module["href"], "courses/applied_R/episodes/03-functions.html")

    def test_existing_numbering_and_visible_pages_are_unchanged(self) -> None:
        self.episode("01-intro.qmd")
        self.episode("02-next.qmd", "module-hidden: false\n")
        self.episode("_instructor-context.qmd")

        modules = build_landing_data.build_data()["modules"]

        self.assertEqual([item["number"] for item in modules], ["01", "02"])
        self.assertEqual(len(modules), 2)


if __name__ == "__main__":
    unittest.main()
