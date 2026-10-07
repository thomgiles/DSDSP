source("analysis.R")
dat <- read_research_data()
before <- dat
selected <- select_observations(dat, c("Ireland", "Brazil"), 2007)
stopifnot(nrow(selected) == 2L, identical(dat, before))
stopifnot(all(selected$year == 2007), !anyDuplicated(selected[c("country", "year")]))
expected <- dat[dat$country %in% c("Ireland", "Brazil") & dat$year == 2007, , drop = FALSE]
stopifnot(identical(selected, expected))
stopifnot(nrow(select_observations(dat, character(), 2007)) == 0L)

expect_failure <- function(expression, text) {
    result <- tryCatch(force(expression), error = identity)
    stopifnot(inherits(result, "error"), grepl(text, conditionMessage(result), fixed = TRUE))
}
expect_failure(select_observations(dat, "Unknown country", 2007), "Unknown country")
expect_failure(select_observations(dat, "Ireland", 2012), "recorded")
expect_failure(select_observations(dat, "Ireland", "2007"), "recorded")
expect_failure(select_observations(dat, c("Ireland", "Ireland"), 2007), "distinct")
expect_failure(validate_data(rbind(dat, dat[1, ])), "repeated")
expect_failure(validate_data(dat[, setdiff(names(dat), "year")]), "Missing columns")
duplicate_columns <- dat
names(duplicate_columns)[2] <- names(duplicate_columns)[1]
expect_failure(validate_data(duplicate_columns), "distinct")
expect_failure(read_research_data("data/not-present.csv"), "not found")

missing <- selected
missing$lifeExp[1] <- NA_real_
validate_data(missing)
checked <- summarise_selection(missing)
stopifnot(checked$selected_rows == 2L, checked$observed_lifeExp == 1L,
          checked$missing_lifeExp == 1L,
          checked$mean_lifeExp_years == missing$lifeExp[2])
missing$lifeExp[] <- NA_real_
stopifnot(is.na(summarise_selection(missing)$mean_lifeExp_years))
expect_failure(make_comparison(missing), "No observed")
empty_summary <- summarise_selection(selected[0, , drop = FALSE])
stopifnot(empty_summary$selected_rows == 0L, is.na(empty_summary$mean_lifeExp_years))

plot <- make_comparison(selected)
stopifnot(inherits(plot, "ggplot"))
built <- ggplot2::ggplot_build(plot)
stopifnot(isTRUE(all.equal(sort(built$data[[1]]$y), sort(selected$lifeExp))))

# Source the app without printing its app object or starting a web server.
app_environment <- new.env(parent = globalenv())
app <- source("app.R", local = app_environment)$value
stopifnot(inherits(app, "shiny.appobj"))
shiny::testServer(app_environment$server, {
    session$setInputs(countries = c("Ireland", "Brazil"), year = "2007")
    stopifnot(identical(selected_data(), expected))
    session$setInputs(countries = "Ireland", year = "1952")
    stopifnot(nrow(selected_data()) == 1L, selected_data()$year == 1952)
    session$setInputs(countries = character())
    error <- tryCatch(selected_data(), error = identity)
    stopifnot(inherits(error, "error"), grepl("Choose at least", conditionMessage(error)))
    session$setInputs(countries = "Unknown country", year = "2007")
    error <- tryCatch(selected_data(), error = identity)
    stopifnot(inherits(error, "error"), grepl("recorded list", conditionMessage(error)))
    session$setInputs(countries = "Ireland", year = "2012")
    error <- tryCatch(selected_data(), error = identity)
    stopifnot(inherits(error, "error"), grepl("recorded year", conditionMessage(error)))
})
cat("Passed: source identity, selections, missingness, failures, plot values and reactive inputs.\n")
