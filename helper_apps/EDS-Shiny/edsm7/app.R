# =========================================================
# EDS-M7 Shiny App: Data Visualization & Perception
# 4 Questions: Wordcloud, Bar Chart, Pie Chart, Truncated Axis
# =========================================================

# ---- Package Setup ----
setup_app_environment <- function() {
  pkgs <- c(
    "shiny", "shinydashboard", "shinyWidgets",
    "plotly", "wordcloud2", "dplyr", "tidyr"
  )
  for (p in pkgs) {
    if (!requireNamespace(p, quietly = TRUE)) {
      install.packages(p, dependencies = TRUE)
    }
    library(p, character.only = TRUE)
  }
}
setup_app_environment()

# ---- Reactive Stores ----
responses <- reactiveValues(
  q1 = data.frame(Response = character()),
  q2 = data.frame(Response = character()),
  q3 = data.frame(Response = character()),
  q4 = data.frame(Response = character())
)

# =========================================================
# UI
# =========================================================
ui <- dashboardPage(
  dashboardHeader(title = "EDS-M7: Data Visualization", titleWidth = 300),
  dashboardSidebar(
    sidebarMenu(
      id = "tabs",
      menuItem("Input Questions", tabName = "input", icon = icon("keyboard")),
      menuItem("Results & Insights", tabName = "results", icon = icon("chart-bar"))
    )
  ),
  dashboardBody(
    tags$head(
      # --- White background + embed mode styling ---
      tags$style(HTML("
        .content-wrapper { background-color: white !important; }
        body.embedded-mode .content-wrapper { margin-left:0!important; padding:0!important; }
        body.embedded-mode .main-header, body.embedded-mode .main-sidebar { display:none!important; }
      ")),
      # --- JS: enable ?embed=true and hash navigation ---
      tags$script(HTML("
        $(document).ready(function() {
          const params = new URLSearchParams(window.location.search);
          const hash = window.location.hash;
          if (params.get('embed') === 'true') {
            $('body').addClass('embedded-mode');
            $('.main-header').hide();
            $('.main-sidebar').hide();
            $('.content-wrapper').css({'margin-left':'0','padding':'0'});
          }
          if (hash.startsWith('#shiny-tab-')) {
            const tabName = hash.replace('#shiny-tab-', '');
            const tryActivate = () => {
              const $tabLink = $('a[data-value=\"' + tabName + '\"]');
              if ($tabLink.length) $tabLink.tab('show');
              else setTimeout(tryActivate, 200);
            };
            tryActivate();
          }
        });
      "))
    ),
    tabItems(
      # =====================================================
      # INPUT TAB: All 4 Questions
      tabItem(
        tabName = "input",
        fluidPage(
          titlePanel("Data Visualization & Perception: Learner Poll"),
          h5("Complete the following short-response polls. Your responses will display in real time in the Results tab."),
          hr(),
          
          # Q1: Favourite snack (Wordcloud)
          box(
            title = "1. What is your favourite snack?",
            status = "primary",
            width = 12,
            h6("Enter your favourite snack (one word or short phrase)."),
            textInput("q1_text", "Snack:",
              placeholder = "e.g., chocolate, fruit, nuts"
            )
          ),
          
          # Q2: Travel mode (Bar Chart)
          box(
            title = "2. What is your preferred mode of travel to campus?",
            status = "primary",
            width = 12,
            h6("Select your preferred travel mode."),
            prettyRadioButtons("q2_travel", "Travel Mode:",
              choices = c(
                "Car" = "Car",
                "Bus" = "Bus",
                "Train" = "Train",
                "Cycling" = "Cycling",
                "Walking" = "Walking",
                "Other" = "Other"
              ),
              animation = "jelly",
              status = "success"
            )
          ),
          
          # Q3: Study hours (Pie Chart)
          box(
            title = "3. How many hours do you study/work per day?",
            status = "primary",
            width = 12,
            h6("Select the range that best describes your typical day."),
            prettyRadioButtons("q3_hours", "Daily Hours:",
              choices = c(
                "0-2 hours" = "0-2 hours",
                "2-4 hours" = "2-4 hours",
                "4-6 hours" = "4-6 hours",
                "6-8 hours" = "6-8 hours",
                "8+ hours" = "8+ hours"
              ),
              animation = "jelly",
              status = "success"
            )
          ),
          
          # Q4: Productivity time (Bar Chart - Truncated Axis)
          box(
            title = "4. What time of day are you most productive?",
            status = "primary",
            width = 12,
            h6("Select when you feel most productive."),
            prettyRadioButtons("q4_time", "Most Productive:",
              choices = c(
                "Early morning (5-8am)" = "Early morning",
                "Morning (8-12pm)" = "Morning",
                "Afternoon (12-5pm)" = "Afternoon",
                "Evening (5-9pm)" = "Evening",
                "Night (9pm+)" = "Night"
              ),
              animation = "jelly",
              status = "success"
            )
          ),
          
          # Single Submit Button for All Questions
          div(style = "text-align: center; margin-top: 20px;",
            actionBttn("submit_all", "Submit All Responses", color = "success", style = "fill", size = "lg")
          )
        )
      ),

      # =====================================================
      # RESULTS TAB: All 4 Visualizations
      tabItem(
        tabName = "results",
        fluidPage(
          titlePanel("Live Results: Visualizations & Discussion"),
          h5("Data refreshes every 10 seconds. Click each tab to explore and discuss."),
          hr(),
          
          tabsetPanel(
            # Q1 Results: Wordcloud
            tabPanel(
              "Favourite Snack (Wordcloud)",
              h4("Which snack dominates visually?"),
              wordcloud2Output("q1_wordcloud", height = "500px"),
              h5("Discussion Points:"),
              tags$ul(
                tags$li("Which snack dominates visually?"),
                tags$li("What does the word size communicate?"),
                tags$li("Would you get the same sense from a simple table of counts?")
              )
            ),
            
            # Q2 Results: Bar Chart
            tabPanel(
              "Travel Mode (Bar Chart)",
              h4("Which mode stands out most?"),
              plotlyOutput("q2_bar", height = "500px"),
              h5("Discussion Points:"),
              tags$ul(
                tags$li("Which mode stands out most?"),
                tags$li("Does the spacing or scale affect how you interpret the data?"),
                tags$li("What makes this chart clear and reliable?")
              )
            ),
            
            # Q3 Results: Pie Chart
            tabPanel(
              "Study/Work Hours (Pie Chart)",
              h4("Which group is the largest?"),
              plotlyOutput("q3_pie", height = "500px"),
              h5("Discussion Points:"),
              tags$ul(
                tags$li("Which group is the largest?"),
                tags$li("What might you miss if the chart had too many slices?"),
                tags$li("When would another chart (like a bar) be clearer?")
              )
            ),
            
            # Q4 Results: Truncated Axis Bar Chart
            tabPanel(
              "Productivity Time (Truncated Axis)",
              h4("Do the differences look exaggerated?"),
              plotlyOutput("q4_bar_truncated", height = "500px"),
              h5("⚠️ Discussion Points (Misleading Visualization):"),
              tags$ul(
                tags$li("The y-axis starts at 50% instead of 0% — why does this change perception?"),
                tags$li("How do the bars look compared to if the axis started at 0%?"),
                tags$li("When might someone use a truncated axis? What's the ethical issue?")
              ),
              hr(),
              h5("Comparison: Same Data with Correct Axis"),
              plotlyOutput("q4_bar_correct", height = "500px")
            )
          )
        )
      )
    )
  )
)

# =========================================================
# SERVER
# =========================================================
server <- function(input, output, session) {
  autoInvalidate <- reactiveTimer(10000)

  # ---- Single Submit Button: Collect All Responses ----
  observeEvent(input$submit_all, {
    # Q1: Snack
    txt <- trimws(input$q1_text)
    if (nzchar(txt)) {
      responses$q1 <- rbind(responses$q1, data.frame(Response = txt))
    }
    updateTextInput(session, "q1_text", value = "")
    
    # Q2: Travel Mode
    if (length(input$q2_travel) > 0) {
      responses$q2 <- rbind(
        responses$q2,
        data.frame(Response = input$q2_travel)
      )
    }
    
    # Q3: Study Hours
    if (length(input$q3_hours) > 0) {
      responses$q3 <- rbind(
        responses$q3,
        data.frame(Response = input$q3_hours)
      )
    }
    
    # Q4: Productivity Time
    if (length(input$q4_time) > 0) {
      responses$q4 <- rbind(
        responses$q4,
        data.frame(Response = input$q4_time)
      )
    }
    
    # Redirect to results tab
    updateTabItems(session, "tabs", "results")
  })

  output$q1_wordcloud <- renderWordcloud2({
    autoInvalidate()
    if (nrow(responses$q1) == 0) {
      return(NULL)
    }
    df <- as.data.frame(table(responses$q1$Response))
    wordcloud2(df, color = "random-light", backgroundColor = "white")
  })

  output$q2_bar <- renderPlotly({
    autoInvalidate()
    if (nrow(responses$q2) == 0) {
      return(NULL)
    }
    df <- as.data.frame(table(responses$q2$Response))
    colnames(df) <- c("Mode", "Count")
    
    plot_ly(df, x = ~Mode, y = ~Count, type = "bar",
      marker = list(color = "steelblue")
    ) %>%
      layout(
        template = "plotly_white",
        yaxis = list(title = "Number of Responses"),
        xaxis = list(title = "Travel Mode"),
        showlegend = FALSE
      )
  })

  output$q3_pie <- renderPlotly({
    autoInvalidate()
    if (nrow(responses$q3) == 0) {
      return(NULL)
    }
    df <- as.data.frame(table(responses$q3$Response))
    colnames(df) <- c("Hours", "Count")
    
    # Order hours categories
    df$Hours <- factor(df$Hours,
      levels = c("0-2 hours", "2-4 hours", "4-6 hours", "6-8 hours", "8+ hours")
    )
    df <- df[order(df$Hours), ]
    
    plot_ly(df, labels = ~Hours, values = ~Count, type = "pie") %>%
      layout(
        template = "plotly_white",
        showlegend = TRUE
      )
  })

  output$q4_bar_truncated <- renderPlotly({
    autoInvalidate()
    if (nrow(responses$q4) == 0) {
      return(NULL)
    }
    df <- as.data.frame(table(responses$q4$Response))
    colnames(df) <- c("Time", "Count")
    
    # Order time categories
    df$Time <- factor(df$Time,
      levels = c("Early morning", "Morning", "Afternoon", "Evening", "Night")
    )
    df <- df[order(df$Time), ]
    
    # TRUNCATED AXIS: starts at 50% of max value (misleading)
    max_count <- max(df$Count)
    y_min <- max_count * 0.5
    
    plot_ly(df, x = ~Time, y = ~Count, type = "bar",
      marker = list(color = "coral")
    ) %>%
      layout(
        template = "plotly_white",
        title = "⚠️ WARNING: Truncated Y-Axis (Misleading!)",
        yaxis = list(
          title = "Number of Responses",
          range = c(y_min, max_count * 1.1)
        ),
        xaxis = list(title = "Time of Day"),
        showlegend = FALSE,
        annotations = list(
          list(
            text = "Y-axis does NOT start at 0!",
            xref = "paper", yref = "paper",
            x = 0.5, y = -0.15, showarrow = FALSE,
            font = list(size = 12, color = "red")
          )
        )
      )
  })

  output$q4_bar_correct <- renderPlotly({
    autoInvalidate()
    if (nrow(responses$q4) == 0) {
      return(NULL)
    }
    df <- as.data.frame(table(responses$q4$Response))
    colnames(df) <- c("Time", "Count")
    
    # Order time categories
    df$Time <- factor(df$Time,
      levels = c("Early morning", "Morning", "Afternoon", "Evening", "Night")
    )
    df <- df[order(df$Time), ]
    
    # CORRECT AXIS: starts at 0
    plot_ly(df, x = ~Time, y = ~Count, type = "bar",
      marker = list(color = "seagreen")
    ) %>%
      layout(
        template = "plotly_white",
        title = "✓ Correct: Y-Axis Starts at 0",
        yaxis = list(
          title = "Number of Responses",
          range = c(0, max(df$Count) * 1.1)
        ),
        xaxis = list(title = "Time of Day"),
        showlegend = FALSE
      )
  })
}

# ---- Launch ----
shinyApp(ui, server)
