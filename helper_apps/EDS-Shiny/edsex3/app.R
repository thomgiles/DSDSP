# =========================================================
# EDS-EXT3 Shiny App: AI Research Impact Room Scan
# 2 Questions: Stage Poll + Keyword Wordcloud
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
  q1 = data.frame(Stage = character()),
  q2 = data.frame(Response = character())
)

# =========================================================
# UI
# =========================================================
ui <- dashboardPage(
  dashboardHeader(title = "EDS-EXT3: AI Room Scan", titleWidth = 300),
  dashboardSidebar(
    sidebarMenu(
      id = "tabs",
      menuItem("Input", tabName = "input", icon = icon("keyboard")),
      menuItem("Results", tabName = "results", icon = icon("chart-bar"))
    )
  ),
  dashboardBody(
    tags$head(
      tags$style(HTML("
        .content-wrapper { background-color: white !important; }
        body.embedded-mode .content-wrapper { margin-left:0!important; padding:0!important; }
        body.embedded-mode .main-header, body.embedded-mode .main-sidebar { display:none!important; }
      ")),
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
      tabItem(
        tabName = "input",
        div(
          role = "tabpanel",
          fluidPage(
            titlePanel("Where is AI already changing research?"),
            h5("Choose the stage where AI feels most visible in your current research context."),
            prettyRadioButtons(
              "q1_stage",
              "Most visible stage:",
              choices = c(
                "Question framing and literature review" = "Question framing and literature review",
                "Data collection and preparation" = "Data collection and preparation",
                "Analysis and coding" = "Analysis and coding",
                "Writing and communication" = "Writing and communication",
                "Publishing, peer review or funding" = "Publishing, peer review or funding",
                "Research administration" = "Research administration"
              ),
              animation = "jelly",
              status = "success"
            ),
            hr(),
            h5("Add one or two short words or phrases that describe the change you are seeing."),
            textAreaInput(
              "q2_text",
              "Keywords:",
              width = "100%",
              rows = 3,
              placeholder = "e.g. speed, uncertainty, automation, access"
            ),
            actionBttn("submit_all", "Submit", color = "success", style = "fill")
          )
        )
      ),
      tabItem(
        tabName = "results",
        div(
          role = "tabpanel",
          fluidPage(
            titlePanel("Room Scan Results"),
            h4("Which research stage feels most affected?"),
            plotlyOutput("q1_bar", height = "400px"),
            h4("Keywords from the room"),
            wordcloud2Output("q2_wordcloud", height = "400px"),
            hr(),
            h5("Discussion prompts"),
            tags$ul(
              tags$li("Which stage is clearly dominant, and which stages are under-represented?"),
              tags$li("Are people describing AI mainly as speed, quality, pressure, access, or risk?"),
              tags$li("Do the room responses suggest the same impact across disciplines?")
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

  observeEvent(input$submit_all, {
    if (length(input$q1_stage) > 0) {
      responses$q1 <- rbind(
        responses$q1,
        data.frame(Stage = input$q1_stage)
      )
    }

    txt <- trimws(input$q2_text)
    if (nzchar(txt)) {
      entries <- unlist(strsplit(txt, "\\s*,\\s*"))
      entries <- entries[nzchar(entries)]
      if (length(entries) > 0) {
        responses$q2 <- rbind(
          responses$q2,
          data.frame(Response = entries)
        )
      }
    }

    updateTextAreaInput(session, "q2_text", value = "")
    updateTabItems(session, "tabs", "results")
  })

  output$q1_bar <- renderPlotly({
    autoInvalidate()
    if (nrow(responses$q1) == 0) {
      return(NULL)
    }

    levels_order <- c(
      "Question framing and literature review",
      "Data collection and preparation",
      "Analysis and coding",
      "Writing and communication",
      "Publishing, peer review or funding",
      "Research administration"
    )

    df <- as.data.frame(table(responses$q1$Stage))
    colnames(df) <- c("Stage", "Count")
    df$Stage <- factor(df$Stage, levels = levels_order)
    df <- df[order(df$Stage), ]

    plot_ly(
      df,
      x = ~Stage,
      y = ~Count,
      type = "bar",
      marker = list(
        color = c(
          "#1f77b4", "#2ca02c", "#ff7f0e",
          "#9467bd", "#d62728", "#8c564b"
        )
      )
    ) %>%
      layout(
        template = "plotly_white",
        yaxis = list(title = "Number of responses"),
        xaxis = list(title = ""),
        showlegend = FALSE
      )
  })

  output$q2_wordcloud <- renderWordcloud2({
    autoInvalidate()
    if (nrow(responses$q2) == 0) {
      return(NULL)
    }
    df <- as.data.frame(table(responses$q2$Response))
    wordcloud2(df, color = "random-light", backgroundColor = "white")
  })
}

# ---- Launch ----
shinyApp(ui, server)
