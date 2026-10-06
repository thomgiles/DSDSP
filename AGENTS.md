# Repository instructions

This repository contains Digital Research Service training material. The Quarto
website lives in `training_site/`; course episodes live in
`training_site/courses/<course>/episodes/`.

## Read at the start of each session

Read `training_site/resources/episode_template.qmd` once at the start of each
session in this repository. Its authoring guide defines the shared lesson
structure, figures, teaching patterns and verification expectations. Apply it
when creating or editing training content; other work should follow the relevant
code and configuration conventions.

Before changing an episode, also read the course's `episodes/_metadata.yml`,
relevant setup/instructor pages and nearby episodes. Follow more specific course
instructions where they exist, including established execution conventions.

## Episode work

- Use the template as a starting point for new episodes and a guide for existing
  ones. Preserve unrelated content, styling, scripts and embedded activities.
- Teach through real researcher tasks, useful outputs, worked examples and
  direct room engagement. Keep prose in British English.
- Default to 10 minutes teaching per topic and five minutes per activity unless
  the user or existing delivery plan specifies otherwise. Count debriefs in the
  activity time; record breaks separately and reconcile timing metadata.
- Add figures where they clarify a process, relationship or comparison. Match
  existing SVG conventions, include accessible descriptions and alt text, and
  check that labels are legible in both HTML and slides.
- Give each task a goal, input, working arrangement, timed steps, room response,
  output to keep, access fallback and reasoned debrief.
- Use code and AI examples where they serve the outcome. Preserve established
  Python/R, Pyodide/WebR and other course integrations. Label fictional examples
  and distinguish source evidence from interpretation and assumptions.
- Update relevant course-overview, setup and instructor guidance when coverage,
  prerequisites or delivery requirements change.

## Change safety and validation

- Inspect relevant files and callers before changing code or configuration.
  Make the smallest coherent change and preserve uncommitted user work.
- Do not commit, push, open a pull request or change branches unless requested.
- Verify software, policy and institutional claims against primary sources.
- Run focused checks appropriate to the change. For episodes, check timing sums,
  figures, links and both HTML/Revealjs renders where supported. Inspect figures
  visually and review the resulting diff with `git diff --check`.
- Keep generated `_site/`, cache and local environment files out of Git. Report
  existing build problems and any isolated validation separately; do not change
  unrelated build configuration merely to make a content check pass.
- Conclude with Changes, Validation, Files and material Notes. State which checks
  actually ran and identify limitations without claiming unperformed testing.
