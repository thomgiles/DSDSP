# DRS Training Materials Monorepo

This repository contains all training content for the Data Research Services (DRS) programme. It was originally developed to support the **Data Science and Digital Skills (DSDS)** training strand funded through the **BBSRC Doctoral Training Programme (DTP)**.

## 🚀 Getting Started

### 1. Clone and Navigate to the Training Site

```bash
git clone <your-repo-url>
cd training_site
```

### 2. Set Up the Python Environment

When using VS Code for Python development, we recommend installing the Python extension. The Python extension enables many features that will be useful for Python developers, including support for managing and using virtual environments.

This page focuses on VS Code-specific features for working with Python virtual environments.

#### VS Code Selecting an interpreter
VS Code will automatically detect when you are in a directory that contains Python files. You will know that VS Code has correctly detected a Python project when you see a Python interpreter appear in the bottom right corner.

To change the selected interpreter open the Command Palette using Cmd + Shift + P on Mac or Ctrl + Shift + P on Windows. Then type “Python: Select Interpreter”. Alternatively, you can click on the current interpreter in the bottom right corner.

VS Code will automatically detect available interpreters and virtual environments. If VS Code does not automatically detect your desired interpreter, you can manually specify the path.

Now that you have selected an interpreter, VS Code will:

Use this interpreter to execute Python code when you press the play button in the top right corner.

Automatically activate this interpreter when you open a new terminal.
Use this interpreter for Notebooks and Interactive Windows.

#### Activating and building the python env

Assuming you have python at path, activate the Python virtual environment as follows:

```bash
which python    

python -m venv .venv
 
source .venv/bin/activate
 
pip install -r requirements.txt

```

n.b. if python not found, then you can theoretically link to any python env that is supported for execution. 

For example one could do: 

```bash
/usr/local/bin/python3.11 -m venv .venv
```

followed by: 

```bash
source .venv/bin/activate
 
pip install -r requirements.txt
```

if you are seeking to change the Quarto project for this site, you will need to install ipykernel and update your Jupyter env: 

```bash
pip install ipykernel
python -m ipykernel install --user --name=DSDSP-env --display-name "DSDSP"
```

### 3. Check the R Environment

Ensure the R environment is working correctly:

```bash
R
```

From the R console:

```r
renv::restore()
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
