# Shared analysis for the course notebook and dashboard.
# The input contains historical country-year observations, not individual data.

validate_data <- function(dat, allow_empty = FALSE) {
    required <- c("country", "year", "pop", "continent", "lifeExp", "gdpPercap")
    if (!is.data.frame(dat)) stop("Expected a data frame.", call. = FALSE)
    if (anyNA(names(dat)) || any(!nzchar(names(dat))) || anyDuplicated(names(dat))) {
        stop("Column names must be distinct and non-empty.", call. = FALSE)
    }
    missing_columns <- setdiff(required, names(dat))
    if (length(missing_columns)) {
        stop("Missing columns: ", paste(missing_columns, collapse = ", "), call. = FALSE)
    }
    if (!nrow(dat) && !allow_empty) stop("The input table has no observations.", call. = FALSE)
    if (!is.character(dat$country) || !is.character(dat$continent)) {
        stop("Country and continent must be character columns.", call. = FALSE)
    }
    if (anyNA(dat$country) || any(!nzchar(trimws(dat$country)))) {
        stop("Every observation needs a non-empty country identifier.", call. = FALSE)
    }
    for (column in c("year", "pop", "lifeExp", "gdpPercap")) {
        if (!is.numeric(dat[[column]])) {
            stop("Expected a numeric column: ", column, call. = FALSE)
        }
        if (any(!is.finite(dat[[column]]) & !is.na(dat[[column]])) || any(is.nan(dat[[column]]))) {
            stop("Non-finite values in ", column, ".", call. = FALSE)
        }
    }
    if (anyNA(dat$year) || any(dat$year != floor(dat$year))) {
        stop("Every observation needs a recorded integer year.", call. = FALSE)
    }
    if (anyDuplicated(dat[c("country", "year")])) {
        stop("Country-year identifiers are repeated; investigate before analysing.", call. = FALSE)
    }
    invisible(dat)
}

read_research_data <- function(path = "data/gapminder_data.csv") {
    if (!is.character(path) || length(path) != 1L || is.na(path) || !nzchar(path)) {
        stop("Provide one input file path.", call. = FALSE)
    }
    if (!file.exists(path)) stop("Input file not found: ", path, call. = FALSE)
    dat <- read.csv(path, stringsAsFactors = FALSE, check.names = FALSE)
    validate_data(dat)
    dat
}

select_observations <- function(dat, countries, year) {
    validate_data(dat)
    if (!is.character(countries) || anyNA(countries) || anyDuplicated(countries)) {
        stop("Countries must be distinct character identifiers without missing values.", call. = FALSE)
    }
    unknown <- setdiff(countries, dat$country)
    if (length(unknown)) stop("Unknown country: ", paste(unknown, collapse = ", "), call. = FALSE)
    if (!is.numeric(year) || length(year) != 1L || is.na(year) || !is.finite(year) ||
        year != floor(year) || !(year %in% dat$year)) {
        stop("Choose one year recorded in the input.", call. = FALSE)
    }
    # Empty GUI selections have a defined result; the app supplies the message.
    dat[dat$country %in% countries & dat$year == year, , drop = FALSE]
}

summarise_selection <- function(dat) {
    validate_data(dat, allow_empty = TRUE)
    observed <- !is.na(dat$lifeExp)
    data.frame(
        selected_rows = nrow(dat),
        observed_lifeExp = sum(observed),
        missing_lifeExp = sum(!observed),
        mean_lifeExp_years = if (any(observed)) mean(dat$lifeExp[observed]) else NA_real_
    )
}

make_comparison <- function(dat) {
    validate_data(dat, allow_empty = TRUE)
    if (!nrow(dat)) stop("Choose at least one observation to plot.", call. = FALSE)
    missing_count <- sum(is.na(dat$lifeExp))
    plotted <- dat[!is.na(dat$lifeExp), , drop = FALSE]
    if (!nrow(plotted)) stop("No observed life-expectancy values are available.", call. = FALSE)
    ggplot2::ggplot(plotted, ggplot2::aes(x = country, y = lifeExp)) +
        ggplot2::geom_col(fill = "#006781") +
        ggplot2::labs(
            title = paste("Historical life expectancy:", paste(unique(dat$year), collapse = ", ")),
            x = "Country", y = "Life expectancy (years)",
            caption = paste("Source: packaged Gapminder country-year data.",
                            missing_count, "missing values are not plotted; they remain in the table.")
        ) +
        ggplot2::theme_minimal(base_size = 13)
}
