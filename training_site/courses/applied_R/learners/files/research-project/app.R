library(shiny)
library(ggplot2)
source("analysis.R", local = TRUE)

# Read the public teaching input once; each session selects its own observations.
research_data <- read_research_data()
country_choices <- sort(unique(research_data$country))
year_choices <- sort(unique(research_data$year))

ui <- fluidPage(
    titlePanel("Explore historical country-year data"),
    p("Select countries and a recorded year. These are historical aggregate observations; the comparison does not establish causation or individual outcomes."),
    sidebarLayout(
        sidebarPanel(
            selectInput("countries", "Countries", choices = country_choices,
                        selected = c("Ireland", "Brazil"), multiple = TRUE),
            selectInput("year", "Recorded year", choices = year_choices,
                        selected = max(year_choices)),
            downloadButton("download", "Download checked selection")
        ),
        mainPanel(
            textOutput("coverage"),
            plotOutput("comparison", height = "350px"),
            tableOutput("observations")
        )
    )
)

server <- function(input, output, session) {
    selected_data <- reactive({
        validate(need(length(input$countries) > 0L, "Choose at least one country."))
        validate(need(all(input$countries %in% country_choices), "Choose countries from the recorded list."))
        validate(need(!anyDuplicated(input$countries), "Choose each country once."))
        validate(need(length(input$year) == 1L && !is.na(input$year) &&
                      input$year %in% as.character(year_choices), "Choose a recorded year."))
        select_observations(research_data, input$countries, as.numeric(input$year))
    })
    output$coverage <- renderText({
        summary <- summarise_selection(selected_data())
        paste(summary$selected_rows, "country-year observations selected;",
              summary$missing_lifeExp, "life-expectancy values missing.")
    })
    output$comparison <- renderPlot({
        dat <- selected_data()
        validate(need(any(!is.na(dat$lifeExp)), "No observed life-expectancy values are available."))
        make_comparison(dat)
    }, alt = "Historical country life expectancy for the selected year; the adjacent table gives the recorded values.")
    output$observations <- renderTable({
        selected_data()[c("country", "year", "lifeExp", "pop")]
    }, digits = 2, rownames = FALSE)
    output$download <- downloadHandler(
        filename = function() "country-year-selection.csv",
        content = function(file) write.csv(selected_data(), file, row.names = FALSE, na = "")
    )
}

shinyApp(ui, server)
