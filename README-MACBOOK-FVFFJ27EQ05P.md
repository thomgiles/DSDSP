# DRS Training Materials Repository

This repository contains training content for the Digital Research Service (DRS). It was originally developed to support the **Data Science and Digital Skills (DSDS)** strand funded through the **BBSRC Doctoral Training Programme (DTP)**.

The main build target is the Quarto site in `training_site/`, rendered to `training_site/_site/` and deployed with Azure Static Web Apps.

## Repository Layout

- `training_site/`: Quarto project, lesson content, Python and R dependencies
- `Deployments/`: Azure Pipelines definitions for development and production
- `helper_apps/`: supporting applications/scripts
- `Documents/`: project documentation and supporting materials

## Branches and CI

The repository has two CI deployment pipelines:

- `Deployments/DSDSP-CI-pipeline dev.yaml`: runs on `Dev`
- `Deployments/DSDSP-CI-pipeline.yaml`: runs on `main`

Both pipelines:

- provision Ubuntu build agents
- install R, Python 3.11, Quarto, TinyTeX, Tectonic, and system libraries
- render the Quarto site from `training_site/`
- verify `_site/index.html` exists
- deploy `_site/` to Azure Static Web Apps

## Local Setup (CI-Aligned)

Follow these steps from a clean clone to mirror the CI environment as closely as possible.

### 1. Clone and move into the Quarto project

```bash
git clone <your-repo-url>
cd <repo-root>/training_site
```

### 2. Python environment

CI uses Python 3.11.

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python --version
pip install --upgrade pip
pip install -r requirements.txt
pip install jupyter pyyaml ipykernel
```

Dependency source of truth:

- `training_site/requirements.txt`

### 3. R environment

CI installs base R and restores/install packages needed for rendering.

```bash
mkdir -p ~/.R/library
export R_LIBS_USER=$HOME/.R/library
R --version
Rscript -e 'install.packages(c("renv","rmarkdown","reticulate","gapminder","tidyverse","readxl","openxlsx","gridExtra","ggExtra","knitr"))'
Rscript -e 'renv::restore(); renv::status()'
```

Dependency source of truth:

- `training_site/renv.lock`

### 4. Quarto and PDF toolchain

The pipelines install Quarto and both TinyTeX and Tectonic support to improve PDF rendering reliability.

Required components for local parity:

- Quarto CLI
- Pandoc
- TinyTeX (`quarto install tinytex`)
- Tectonic
- Ghostscript
- `librsvg2-bin`
- system fonts (including CJK coverage)

Quick verification commands:

```bash
quarto --version
pandoc --version
tectonic --version
```

Install TinyTeX (if missing):

```bash
quarto install tinytex
```

### 5. OS-specific system dependencies

#### Ubuntu (matches CI most closely)

On Ubuntu agents, CI installs:

- `curl`
- `libxml2-dev`
- `libcurl4-openssl-dev`
- `libssl-dev`
- `libfontconfig1-dev`
- `libfreetype6-dev`
- `libharfbuzz-dev`
- `libfribidi-dev`
- `libpng-dev`
- `chromium-browser`
- `fonts-noto-cjk`
- `fonts-dejavu`
- `libtiff5-dev`
- `libjpeg-dev`
- `libgl1-mesa-dev`
- `libgmp-dev`
- `pandoc`
- `ghostscript`
- `librsvg2-bin`

Ubuntu install command:

```bash
sudo apt-get update
sudo apt-get install -y \
  curl \
  libxml2-dev libcurl4-openssl-dev libssl-dev \
  libfontconfig1-dev libfreetype6-dev \
  libharfbuzz-dev libfribidi-dev libpng-dev \
  chromium-browser fonts-noto-cjk fonts-dejavu \
  libtiff5-dev libjpeg-dev libgl1-mesa-dev libgmp-dev \
  pandoc ghostscript librsvg2-bin
```

#### macOS (Homebrew)

macOS package names differ from Ubuntu, but this set covers the same capabilities needed for Quarto rendering and PDF/image generation.

```bash
brew update
brew install \
  python@3.11 \
  r \
  quarto \
  pandoc \
  tectonic \
  ghostscript \
  librsvg \
  pkg-config \
  libxml2 \
  openssl \
  freetype \
  harfbuzz \
  fribidi \
  libpng \
  jpeg-turbo \
  gmp
```

Optional browser support used in some rendering contexts:

```bash
brew install --cask chromium
```

If your environment requires CJK font support, install compatible fonts (for example Noto CJK families via Homebrew casks).

## Build and Validate Locally

Run from `training_site/`:

```bash
export R_LIBS_USER=$HOME/.R/library
export QUARTO_TMPDIR=$PWD/.tmp
mkdir -p .tmp
export PATH=$PATH:$HOME/.TinyTeX/bin/x86_64-linux:$HOME/.TinyTeX/bin/universal-darwin
quarto render . --no-cache --log-level debug
```

Validate output:

```bash
ls -al _site
test -f _site/index.html && echo "index.html OK"
```

Primary expected output:

- `training_site/_site/index.html`

## Local Deployment Smoke Tests

A local smoke test suite is available at:

- `scripts/test_local_deployment.sh`

Run from repository root:

```bash
scripts/test_local_deployment.sh --preflight
```

What it checks:

- required project files are present
- key tools are installed (`quarto`, Python, and optional `Rscript`)
- version commands run successfully

Run full CI-like smoke test (includes render):

```bash
scripts/test_local_deployment.sh
```

What it checks after render:

- key output pages exist (`_site/index.html` and core module index pages)
- homepage contains expected navigation/content markers
- rendered HTML page count is above a minimum threshold
- `.qmd` links are inspected for unresolved targets

Useful options:

- `--skip-render`: validate existing `_site/` output only
- `--strict-links`: fail if unresolved `.qmd` links are detected
- `--help`: show usage

## CI Parity Checklist

Use this checklist when reproducing CI failures locally:

1. Python is 3.11
2. Virtual environment is active
3. `requirements.txt` is installed
4. R is available and `renv::status()` is clean
5. `quarto --version` returns successfully
6. TinyTeX binaries are on `PATH`
7. `quarto render . --no-cache --log-level debug` completes
8. `_site/index.html` exists

## Common Troubleshooting

### Missing LaTeX/PDF tooling

Symptoms:

- PDF render failures
- missing TeX binaries

Checks and fixes:

```bash
quarto install tinytex
export PATH=$PATH:$HOME/.TinyTeX/bin/x86_64-linux
```

### Missing system libraries

Symptoms:

- errors for font, image, or graphics libraries during render

Fix:

- install the Linux package equivalents listed in the CI package section

### R package restore mismatch

Symptoms:

- `renv::status()` reports out-of-sync library

Fix:

```bash
Rscript -e 'renv::restore()'
Rscript -e 'renv::status()'
```

### Python dependency issues

Symptoms:

- import errors in notebooks or Quarto execution

Fix:

```bash
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## Contribution Workflow

1. Create a feature branch from `Dev`
2. Open a pull request into `Dev`
3. Confirm CI passes
4. Promote tested changes from `Dev` to `main`

Branch intent:

- `Dev`: integration branch for active development
- `main`: production branch

## Notes

- Do not commit generated output in `_site/`
- Do not commit local package libraries such as `renv/library/`
- Deployment secrets and SWA tokens are managed in Azure variable groups, not in this repository

## Support

For issues or questions, contact the maintainers or open a GitHub issue.
