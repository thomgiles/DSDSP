# =========================================================
# EDS-EXT1 Shiny App: Responsible Use of AI in Research
# 2 Questions: AI Tools Wordcloud + Confidence Poll
# =========================================================

# ---- Package Setup ----
setup_app_environment <- function() {
  pkgs <- c("shiny", "shinydashboard", "shinyWidgets",
            "plotly", "wordcloud2", "dplyr", "tidyr")
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
  q2 = data.frame(Confidence = character())
)

# =========================================================
# UI
# =========================================================
ui <- dashboardPage(
  dashboardHeader(title = "EDS-EXT1: AI Feedback App", titleWidth = 300),

  dashboardSidebar(
    sidebarMenu(
      id = "tabs",
      menuItem("AI Tools (Input)", tabName = "q1_input", icon = icon("keyboard")),
      menuItem("AI Tools (Results)", tabName = "q1_results", icon = icon("chart-bar")),
      menuItem("Confidence Poll (Input)", tabName = "q2_input", icon = icon("keyboard")),
      menuItem("Confidence Poll (Results)", tabName = "q2_results", icon = icon("chart-bar"))
    )
  ),

  dashboardBody(
    tags$head(
      tags$style(HTML("
        .content-wrapper { background-color: white !important; }
        body.embedded-mode .content-wrapper { margin-left:0!important; padding:0!important; }
        body.embedded-mode .main-header, body.embedded-mode .main-sidebar { display:none!important; }
      ")),

      # --- WORKING HASH NAVIGATION (same logic as EDS-M1) ---
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
              else setTimeout(tryActivate, 150);
            };
            tryActivate();
          }
        });
      "))
    ),

    # Important: Bootstrap-friendly wrapper for each tabItem
    tabItems(

      tabItem(
        tabName = "q1_input",
        div(role = "tabpanel",
            fluidPage(
              titlePanel("Which AI tools have you used?"),
              h5("Enter tools as a comma-separated list."),
              textAreaInput("q1_text", "Your AI tools:",
                            width = "100%", rows = 3,
                            placeholder = "e.g. ChatGPT, GitHub Copilot, Claude"),
              actionBttn("q1_submit", "Submit", color = "success", style = "fill")
            )
        )
      ),

      tabItem(
        tabName = "q1_results",
        div(role = "tabpanel",
            fluidPage(
              titlePanel("AI Tools Used"),
              h4("Live Wordcloud (refreshes every 10 seconds)"),
              wordcloud2Output("q1_wordcloud", height = "500px")
            )
        )
      ),

      tabItem(
        tabName = "q2_input",
        div(role = "tabpanel",
            fluidPage(
              titlePanel("How confident are you about using AI responsibly?"),
              prettyRadioButtons("q2_confidence", "Confidence Level:",
                                 choices = c(
                                   "Very confident" = "Very confident",
                                   "Somewhat confident" = "Somewhat confident",
                                   "Neutral" = "Neutral",
                                   "Unsure" = "Unsure"
                                 ),
                                 animation = "jelly", status = "success"),
              actionBttn("q2_submit", "Submit", color = "success", style = "fill")
            )
        )
      ),

      tabItem(
        tabName = "q2_results",
        div(role = "tabpanel",
            fluidPage(
              titlePanel("Confidence Poll Results"),
              h4("Live Results (refreshes every 10 seconds)"),
              plotlyOutput("q2_plot", height = "500px")
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

  observeEvent(input$q1_submit, {
    txt <- trimws(input$q1_text)
    if (nzchar(txt)) {
      entries <- unlist(strsplit(txt, "\\s*,\\s*"))
      responses$q1 <- rbind(responses$q1, data.frame(Response = entries))
    }
    updateTextAreaInput(session, "q1_text", value = "")
    updateTabItems(session, "tabs", "q1_results")
  })

  output$q1_wordcloud <- renderWordcloud2({
    autoInvalidate()
    if (nrow(responses$q1) == 0) return(NULL)
    df <- as.data.frame(table(responses$q1$Response))
    wordcloud2(df, color = "random-light", backgroundColor = "white")
  })

  observeEvent(input$q2_submit, {
    if (length(input$q2_confidence) > 0) {
      responses$q2 <- rbind(
        responses$q2,
        data.frame(Confidence = input$q2_confidence)
      )
    }
    updateTabItems(session, "tabs", "q2_results")
  })

  output$q2_plot <- renderPlotly({
    autoInvalidate()
    if (nrow(responses$q2) == 0) return(NULL)
    df <- as.data.frame(table(responses$q2$Confidence))
    colnames(df) <- c("Confidence", "Count")
    df$Confidence <- factor(df$Confidence,
                            levels = c("Very confident", "Somewhat confident",
                                       "Neutral", "Unsure"))
    df <- df[order(df$Confidence), ]
    plot_ly(df, x = ~Confidence, y = ~Count, type = "bar",
            marker = list(color = c("darkgreen","lightgreen","orange","lightcoral"))) %>%
      layout(template = "plotly_white",
             yaxis = list(title = "Number of Responses"),
             xaxis = list(title = "Confidence Level"),
             showlegend = FALSE)
  })

}

# ---- Launch ----
shinyApp(ui, server)
