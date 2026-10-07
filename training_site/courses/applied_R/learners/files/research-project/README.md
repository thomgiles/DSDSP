# Applied R research project

Use a practice copy for lessons 5–8. Open this folder as an RStudio project; run
commands from its root. The CSV is the existing course's historical Gapminder
teaching data. It contains country-year aggregates, not individual measurements.

Required packages: `ggplot2` and `shiny`; the course setup explains installation.
Rendering the notebook also needs Quarto, `knitr` and `rmarkdown`.

1. Inspect `data/gapminder_data.csv` and retain it unchanged.
2. Read `analysis.R`; it is shared by the report and app.
3. Run `Rscript tests.R`, or `source("tests.R")` in the R console.
4. Render `report.qmd` with RStudio's Render button or `quarto render report.qmd`.
5. Run `shiny::runApp(".")` from the R console; use Stop or Esc to stop the app.

Use `countries` and `year` in the report's parameters to change its question.
Re-render and inspect the inline values, table and figure. The app instead
recalculates its selection when an input changes. It requires a running R
process; publishing `report.html` does not publish a live Shiny application.

Missing life-expectancy values remain in selected tables. The summary reports
observed and missing counts; its mean uses observed country values without
population weights. The chart omits missing measurements and discloses the count.
Do not silently replace missing data, remove longer/larger observations or change
the original input to obtain a preferred result.

The existing data derive from the [Gapminder R package](https://jennybc.github.io/gapminder/).
Retain its source information when sharing outputs. These teaching scripts are
covered by the course's code licence. Check permissions before adapting the app
to confidential material; this example uses public historical data and has no
upload facility.
