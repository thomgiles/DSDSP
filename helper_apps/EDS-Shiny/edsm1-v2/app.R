# =========================================================
# EDS-M1-v2 Shiny App
# Consolidated Input/Results tabs with all EDS-M1 plots
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
  q2 = data.frame(Task = character(), Tool = character()),
  q3 = data.frame(Response = character()),
  q4 = data.frame(
    Passwords = numeric(),
    MFA = numeric(),
    Device = numeric(),
    VPN = numeric(),
    Backup = numeric(),
    Cyber = numeric()
  )
)

# =========================================================
# UI
# =========================================================
ui <- dashboardPage(
  dashboardHeader(title = "EDS-M1-v2: Feedback App", titleWidth = 320),
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
        body.embedded-mode .content-wrapper { margin-left: 0 !important; padding: 0 !important; }
        body.embedded-mode .main-header, body.embedded-mode .main-sidebar { display: none !important; }
        .box { border-top: 2px solid #3c8dbc; }
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
              const $tabLink = $('a[data-value=\\\"' + tabName + '\\\"]');
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
        fluidPage(
          titlePanel("EDS-M1 Inputs"),

          box(
            width = 12,
            title = "1) Basic data tools needed at UoN",
            status = "primary",
            solidHeader = FALSE,
            h5("Enter tools or platforms as a comma-separated list (phrases allowed)."),
            textAreaInput(
              "q1_text",
              "Your tools:",
              width = "100%",
              rows = 3,
              placeholder = "e.g. Excel, Python, Research Data Management Portal"
            ),
            actionBttn("q1_submit", "Submit Q1", color = "success", style = "fill")
          ),

          box(
            width = 12,
            title = "2) Match research tasks to digital tools",
            status = "primary",
            solidHeader = FALSE,
            h5("Select the most appropriate digital tool(s) for each task."),
            pickerInput(
              "q2_task1",
              "Co-write a manuscript:",
              choices = c("Teams", "Word", "SharePoint", "RIS", "UniCore", "OneDrive"),
              multiple = TRUE,
              options = pickerOptions(actionsBox = TRUE)
            ),
            pickerInput(
              "q2_task2",
              "Submit a funding bid:",
              choices = c("Teams", "Word", "SharePoint", "RIS", "UniCore", "OneDrive"),
              multiple = TRUE,
              options = pickerOptions(actionsBox = TRUE)
            ),
            pickerInput(
              "q2_task3",
              "Order equipment:",
              choices = c("Teams", "Word", "SharePoint", "RIS", "UniCore", "OneDrive"),
              multiple = TRUE,
              options = pickerOptions(actionsBox = TRUE)
            ),
            pickerInput(
              "q2_task4",
              "Share large datasets:",
              choices = c("Teams", "Word", "SharePoint", "RIS", "UniCore", "OneDrive"),
              multiple = TRUE,
              options = pickerOptions(actionsBox = TRUE)
            ),
            actionBttn("q2_submit", "Submit Q2", color = "success", style = "fill")
          ),

          box(
            width = 12,
            title = "3) Digital tools to support research aims",
            status = "primary",
            solidHeader = FALSE,
            pickerInput(
              "q3_select",
              "Select one or more tools:",
              choices = c(
                "R", "Python", "SQL", "Excel", "Teams", "SharePoint",
                "GitHub", "ORCID", "RIS", "UniCore", "Other"
              ),
              multiple = TRUE,
              options = pickerOptions(actionsBox = TRUE)
            ),
            actionBttn("q3_submit", "Submit Q3", color = "success", style = "fill")
          ),

          box(
            width = 12,
            title = "4) Reflect on your current digital security setup",
            status = "primary",
            solidHeader = FALSE,
            h5("Rate each area (1 = low / not implemented, 10 = fully compliant)."),
            sliderInput("q4_pw", "Passwords & Access Management", 1, 10, 5, step = 1),
            sliderInput("q4_mfa", "Multi-Factor Authentication (MFA)", 1, 10, 5, step = 1),
            sliderInput("q4_dev", "Device & Data Protection", 1, 10, 5, step = 1),
            sliderInput("q4_vpn", "Secure Remote Access (VPN use)", 1, 10, 5, step = 1),
            sliderInput("q4_bak", "Data Backup Strategy", 1, 10, 5, step = 1),
            sliderInput("q4_cyb", "Cybersecurity Awareness", 1, 10, 5, step = 1),
            actionBttn("q4_submit", "Submit Q4", color = "success", style = "fill")
          )
        )
      ),

      tabItem(
        tabName = "results",
        fluidPage(
          titlePanel("EDS-M1 Results"),

          box(
            width = 12,
            title = "Q1: Data Tools Wordcloud",
            status = "primary",
            solidHeader = FALSE,
            h5("Live wordcloud (refreshes every 10 seconds)"),
            wordcloud2Output("q1_wordcloud", height = "420px")
          ),

          box(
            width = 12,
            title = "Q2: Research Task Mapping",
            status = "primary",
            solidHeader = FALSE,
            h5("Refreshes every 10 seconds"),
            tabsetPanel(
              tabPanel("Co-write a manuscript", plotlyOutput("q2_plot_1", height = "360px")),
              tabPanel("Submit a funding bid", plotlyOutput("q2_plot_2", height = "360px")),
              tabPanel("Order equipment", plotlyOutput("q2_plot_3", height = "360px")),
              tabPanel("Share large datasets", plotlyOutput("q2_plot_4", height = "360px"))
            )
          ),

          box(
            width = 12,
            title = "Q3: Research Tools Overview",
            status = "primary",
            solidHeader = FALSE,
            plotlyOutput("q3_bar", height = "420px")
          ),

          box(
            width = 12,
            title = "Q4: Digital Security Overview",
            status = "primary",
            solidHeader = FALSE,
            h5("Average self-ratings across all participants (auto-refresh every 10 seconds)"),
            plotlyOutput("q4_radar", height = "560px")
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

  # ---- Q1 ----
  observeEvent(input$q1_submit, {
    txt <- trimws(input$q1_text)
    if (nzchar(txt)) {
      entries <- unlist(strsplit(txt, "\\s*,\\s*"))
      responses$q1 <- rbind(responses$q1, data.frame(Response = entries))
    }
    updateTextAreaInput(session, "q1_text", value = "")
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

  # ---- Q2 ----
  observeEvent(input$q2_submit, {
    tasks <- list(
      "Co-write a manuscript" = input$q2_task1,
      "Submit a funding bid" = input$q2_task2,
      "Order equipment" = input$q2_task3,
      "Share large datasets" = input$q2_task4
    )

    all_entries <- do.call(rbind, lapply(names(tasks), function(t) {
      if (length(tasks[[t]]) > 0) {
        data.frame(Task = t, Tool = tasks[[t]])
      }
    }))

    if (!is.null(all_entries)) {
      responses$q2 <- rbind(responses$q2, all_entries)
    }

    updateTabItems(session, "tabs", "results")
  })

  render_task_plot <- function(task_name) {
    renderPlotly({
      autoInvalidate()
      if (nrow(responses$q2) == 0) {
        return(NULL)
      }
      df <- responses$q2 %>%
        filter(Task == task_name) %>%
        group_by(Tool) %>%
        summarise(Freq = n(), .groups = "drop")

      if (nrow(df) == 0) {
        return(NULL)
      }

      plot_ly(df, x = ~Tool, y = ~Freq, type = "bar", marker = list(color = "steelblue")) %>%
        layout(
          template = "plotly_white",
          yaxis = list(title = "Frequency"),
          xaxis = list(title = "Tool")
        )
    })
  }

  output$q2_plot_1 <- render_task_plot("Co-write a manuscript")
  output$q2_plot_2 <- render_task_plot("Submit a funding bid")
  output$q2_plot_3 <- render_task_plot("Order equipment")
  output$q2_plot_4 <- render_task_plot("Share large datasets")

  # ---- Q3 ----
  observeEvent(input$q3_submit, {
    if (length(input$q3_select) > 0) {
      responses$q3 <- rbind(
        responses$q3,
        data.frame(Response = paste(input$q3_select, collapse = ", "))
      )
    }
    updateTabItems(session, "tabs", "results")
  })

  output$q3_bar <- renderPlotly({
    autoInvalidate()
    if (nrow(responses$q3) == 0) {
      return(NULL)
    }

    tools <- unlist(strsplit(paste(responses$q3$Response, collapse = ","), ",\\s*"))
    df <- as.data.frame(table(tools))

    plot_ly(df, x = ~tools, y = ~Freq, type = "bar", marker = list(color = "dodgerblue3")) %>%
      layout(
        template = "plotly_white",
        yaxis = list(title = "Count"),
        xaxis = list(title = "Tool")
      )
  })

  # ---- Q4 ----
  observeEvent(input$q4_submit, {
    new <- data.frame(
      Passwords = input$q4_pw,
      MFA = input$q4_mfa,
      Device = input$q4_dev,
      VPN = input$q4_vpn,
      Backup = input$q4_bak,
      Cyber = input$q4_cyb
    )
    responses$q4 <- rbind(responses$q4, new)
    updateTabItems(session, "tabs", "results")
  })

  output$q4_radar <- renderPlotly({
    autoInvalidate()
    if (nrow(responses$q4) == 0) {
      return(NULL)
    }

    avg <- colMeans(responses$q4)
    df <- data.frame(Category = names(avg), Score = as.numeric(avg))
    df <- rbind(df, df[1, ])

    plot_ly(type = "scatterpolar", mode = "lines+fill") %>%
      add_trace(
        r = df$Score,
        theta = df$Category,
        fill = "toself",
        name = "Average Score",
        fillcolor = "rgba(0,123,255,0.4)",
        line = list(color = "rgba(0,123,255,0.8)", width = 2)
      ) %>%
      layout(
        template = "plotly_white",
        polar = list(
          radialaxis = list(range = c(0, 10), tickfont = list(size = 10)),
          angularaxis = list(tickfont = list(size = 10))
        ),
        showlegend = FALSE
      )
  })
}

# ---- Launch ----
shinyApp(ui, server)
