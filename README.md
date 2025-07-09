# DRS Training Materials Monorepo

This repository contains all training content for the Data Research Services (DRS) programme. It was originally developed to support the **Data Science and Digital Skills (DSDS)** training strand funded through the **BBSRC Doctoral Training Programme (DTP)**.

## 🚀 Getting Started

### 1. Clone and Navigate to the Training Site

```bash
git clone <your-repo-url>
cd training_site
```

### 2. Set Up the Python Environment

Activate the Python virtual environment:

```bash
source .venv/bin/activate
```

### 3. Check the R Environment

Ensure the R environment is working correctly:

```bash
R
```

From the R console:

```r
renv::status()
```

This verifies that the R package environment is in sync with the `renv.lock` file.

### 4. Software Dependencies

All R dependencies are managed using [`renv`](https://rstudio.github.io/renv/), and Python dependencies via a local virtual environment (`.venv`).

* R dependencies are specified in `training_site/renv.lock`
* Python dependencies are listed in `training_site/requirements.txt`

## 🧲 Build and Test

Continuous Integration (CI) is enabled for the `dev` and `main` branches via Azure Pipelines.

### Contribution Workflow

* All development should occur on feature branches.
* Changes must be merged into `dev` via pull request (PR).
* The `main` branch is protected and reflects the production-ready version of the site.

## 🛠️ Additional Notes

* Rendering is handled via [Quarto](https://quarto.org).
* The static site is served from `training_site/_site`.
* Avoid committing any content from `_site/` or `renv/library/`.

---

For any issues or questions, please contact the maintainers or open a GitHub issue.
