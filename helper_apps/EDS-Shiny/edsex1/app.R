# =========================================================
# EDS-EXT1 Shiny App: Generative AI Room Scan
# 4 Questions: tools, research impact area, keywords, confidence
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
  q1 = data.frame(Tool = character()),
  q2 = data.frame(Area = character()),
  q3 = data.frame(Response = character()),
  q4 = data.frame(Confidence = integer())
)

# =========================================================
# UI
# =========================================================
ui <- dashboardPage(
  dashboardHeader(title = "EDS-EXT1: Generative AI Room Scan", titleWidth = 320),
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
            const rawTabName = hash.replace('#shiny-tab-', '');
            const tabAliases = {
              q1_input: 'input',
              q2_input: 'input',
              q1_results: 'results',
              q2_results: 'results'
            };
            const tabName = tabAliases[rawTabName] || rawTabName;
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
            h5("Answer the four questions below, then submit to update the room scan."),
            checkboxGroupButtons(
              "q1_tools",
              "1. What AI tools have you used?",
              choices = c(
                "ChatGPT" = "ChatGPT",
                "Microsoft Copilot" = "Microsoft Copilot",
                "Claude" = "Claude",
                "Gemini" = "Gemini",
                "GitHub Copilot" = "GitHub Copilot",
                "Perplexity" = "Perplexity",
                "NotebookLM" = "NotebookLM",
                "Other / local tools" = "Other / local tools"
              ),
              justified = FALSE,
              checkIcon = list(
                yes = icon("check-square"),
                no = icon("square")
              ),
              status = "primary"
            ),
            hr(),
            prettyRadioButtons(
              "q2_area",
              "2. In what areas do you think AI is changing research the most?",
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
            h5("3. What keywords do you associate with generative AI use?"),
            textAreaInput(
              "q3_text",
              "Keywords:",
              width = "100%",
              rows = 3,
              placeholder = "e.g. speed, uncertainty, automation, access"
            ),
            hr(),
            prettyRadioButtons(
              "q4_confidence",
              "4. How confident are you in using AI in your research?",
              choices = c(
                "0%" = 0,
                "25%" = 25,
                "50%" = 50,
                "75%" = 75,
                "100%" = 100
              ),
              animation = "jelly",
              status = "warning"
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
            fluidRow(
              column(
                width = 6,
                box(
                  title = "AI Tools Used",
                  width = 12,
                  solidHeader = TRUE,
                  status = "primary",
                  plotlyOutput("q1_pie", height = "320px")
                )
              ),
              column(
                width = 6,
                box(
                  title = "Where AI Is Changing Research Most",
                  width = 12,
                  solidHeader = TRUE,
                  status = "success",
                  plotlyOutput("q2_bar", height = "320px")
                )
              )
            ),
            fluidRow(
              column(
                width = 6,
                box(
                  title = "Keywords Associated with Generative AI",
                  width = 12,
                  solidHeader = TRUE,
                  status = "info",
                  wordcloud2Output("q3_wordcloud", height = "320px")
                )
              ),
              column(
                width = 6,
                box(
                  title = "Confidence in Using AI in Research",
                  width = 12,
                  solidHeader = TRUE,
                  status = "warning",
                  plotlyOutput("q4_line", height = "320px")
                )
              )
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
    if (length(input$q1_tools) > 0) {
      responses$q1 <- rbind(
        responses$q1,
        data.frame(Tool = input$q1_tools)
      )
    }

    if (!is.null(input$q2_area) && nzchar(input$q2_area)) {
      responses$q2 <- rbind(
        responses$q2,
        data.frame(Area = input$q2_area)
      )
    }

    txt <- trimws(input$q3_text)
    if (nzchar(txt)) {
      entries <- unlist(strsplit(txt, "\\s*,\\s*"))
      entries <- entries[nzchar(entries)]
      entries <- tolower(trimws(entries))
      if (length(entries) > 0) {
        responses$q3 <- rbind(
          responses$q3,
          data.frame(Response = entries)
        )
      }
    }

    if (!is.null(input$q4_confidence) && nzchar(as.character(input$q4_confidence))) {
      responses$q4 <- rbind(
        responses$q4,
        data.frame(Confidence = as.integer(input$q4_confidence))
      )
    }

    updateTextAreaInput(session, "q3_text", value = "")
    updateTabItems(session, "tabs", "results")
  })

  output$q1_pie <- renderPlotly({
    autoInvalidate()
    if (nrow(responses$q1) == 0) {
      return(NULL)
    }

    df <- as.data.frame(table(responses$q1$Tool))
    colnames(df) <- c("Tool", "Count")
    plot_ly(
      df,
      labels = ~Tool,
      values = ~Count,
      type = "pie",
      textinfo = "label+percent",
      hovertemplate = "%{label}<br>Responses: %{value}<extra></extra>"
    ) %>%
      layout(
        template = "plotly_white",
        showlegend = TRUE
      )
  })

  output$q2_bar <- renderPlotly({
    autoInvalidate()
    if (nrow(responses$q2) == 0) {
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

    df <- as.data.frame(table(responses$q2$Area))
    colnames(df) <- c("Area", "Count")
    df$Area <- factor(df$Area, levels = levels_order)
    df <- df[order(df$Area), ]

    plot_ly(
      df,
      x = ~Area,
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

  output$q3_wordcloud <- renderWordcloud2({
    autoInvalidate()
    if (nrow(responses$q3) == 0) {
      return(NULL)
    }
    df <- as.data.frame(table(responses$q3$Response))
    wordcloud2(df, color = "random-light", backgroundColor = "white")
  })

  output$q4_line <- renderPlotly({
    autoInvalidate()
    if (nrow(responses$q4) == 0) {
      return(NULL)
    }

    levels_order <- c(0, 25, 50, 75, 100)
    df <- as.data.frame(table(factor(responses$q4$Confidence, levels = levels_order)))
    colnames(df) <- c("Confidence", "Count")
    df$Confidence <- as.integer(as.character(df$Confidence))

    plot_ly(
      df,
      x = ~Confidence,
      y = ~Count,
      type = "scatter",
      mode = "lines+markers",
      line = list(color = "#f39c12", width = 3),
      marker = list(color = "#f39c12", size = 10),
      hovertemplate = "Confidence: %{x}%<br>Responses: %{y}<extra></extra>"
    ) %>%
      layout(
        template = "plotly_white",
        xaxis = list(
          title = "Confidence (%)",
          tickvals = levels_order,
          ticktext = paste0(levels_order, "%")
        ),
        yaxis = list(title = "Number of responses"),
        showlegend = FALSE
      )
  })
}

# ---- Launch ----
shinyApp(ui, server)
