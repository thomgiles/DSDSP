# =========================================================
# EDS-M1 Shiny App (Full)
# Clean white theme, live results, and embed support
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
  dashboardHeader(title = "EDS-M1: Feedback App", titleWidth = 300),
  dashboardSidebar(
    sidebarMenu(
      id = "tabs",
      menuItem("Data Tools (Input)", tabName = "q1_input", icon = icon("keyboard")),
      menuItem("Data Tools (Results)", tabName = "q1_results", icon = icon("chart-bar")),
      menuItem("Research Tasks (Input)", tabName = "q2_input", icon = icon("keyboard")),
      menuItem("Research Tasks (Results)", tabName = "q2_results", icon = icon("chart-bar")),
      menuItem("Research Aims (Input)", tabName = "q3_input", icon = icon("keyboard")),
      menuItem("Research Aims (Results)", tabName = "q3_results", icon = icon("chart-bar")),
      menuItem("Digital Security (Input)", tabName = "q4_input", icon = icon("keyboard")),
      menuItem("Digital Security (Results)", tabName = "q4_results", icon = icon("chart-bar"))
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
      # Q1
      tabItem(
        tabName = "q1_input",
        fluidPage(
          titlePanel("What basic data tools do you need to do research at UoN?"),
          h5("Enter tools or platforms as a comma-separated list (phrases allowed)."),
          textAreaInput("q1_text", "Your tools:",
            width = "100%", rows = 3,
            placeholder = "e.g. Excel, Python, Research Data Management Portal"
          ),
          actionBttn("q1_submit", "Submit", color = "success", style = "fill")
        )
      ),
      tabItem(
        tabName = "q1_results",
        fluidPage(
          titlePanel("Data Tools"),
          h4("Live Wordcloud (refreshes every 10 seconds)"),
          wordcloud2Output("q1_wordcloud", height = "500px")
        )
      ),

      # =====================================================
      # Q2
      tabItem(
        tabName = "q2_input",
        fluidPage(
          titlePanel("Match Research Tasks to Digital Tools"),
          h5("Select the most appropriate digital tool(s) for each task."),
          hr(),
          pickerInput("q2_task1", "1. Co-write a manuscript:",
            choices = c("Teams", "Word", "SharePoint", "RIS", "UniCore", "OneDrive"),
            multiple = TRUE, options = pickerOptions(actionsBox = TRUE)
          ),
          pickerInput("q2_task2", "2. Submit a funding bid:",
            choices = c("Teams", "Word", "SharePoint", "RIS", "UniCore", "OneDrive"),
            multiple = TRUE, options = pickerOptions(actionsBox = TRUE)
          ),
          pickerInput("q2_task3", "3. Order equipment:",
            choices = c("Teams", "Word", "SharePoint", "RIS", "UniCore", "OneDrive"),
            multiple = TRUE, options = pickerOptions(actionsBox = TRUE)
          ),
          pickerInput("q2_task4", "4. Share large datasets:",
            choices = c("Teams", "Word", "SharePoint", "RIS", "UniCore", "OneDrive"),
            multiple = TRUE, options = pickerOptions(actionsBox = TRUE)
          ),
          actionBttn("q2_submit", "Submit", color = "success", style = "fill")
        )
      ),
      tabItem(
        tabName = "q2_results",
        fluidPage(
          titlePanel("Research Task Mapping"),
          h4("Refreshes every 10 seconds"),
          tabsetPanel(
            tabPanel("1. Co-write a manuscript", plotlyOutput("q2_plot_1", height = "400px")),
            tabPanel("2. Submit a funding bid", plotlyOutput("q2_plot_2", height = "400px")),
            tabPanel("3. Order equipment", plotlyOutput("q2_plot_3", height = "400px")),
            tabPanel("4. Share large datasets", plotlyOutput("q2_plot_4", height = "400px"))
          )
        )
      ),

      # =====================================================
      # Q3
      tabItem(
        tabName = "q3_input",
        fluidPage(
          titlePanel("What digital tools may you need to support your research aims?"),
          pickerInput("q3_select", "Select one or more tools:",
            choices = c(
              "R", "Python", "SQL", "Excel", "Teams", "SharePoint",
              "GitHub", "ORCID", "RIS", "UniCore", "Other"
            ),
            multiple = TRUE, options = pickerOptions(actionsBox = TRUE)
          ),
          actionBttn("q3_submit", "Submit", color = "success", style = "fill")
        )
      ),
      tabItem(
        tabName = "q3_results",
        fluidPage(
          titlePanel("Research Tools Overview"),
          plotlyOutput("q3_bar", height = "500px")
        )
      ),

      # =====================================================
      # Q4
      tabItem(
        tabName = "q4_input",
        fluidPage(
          titlePanel("Reflect on your current digital setup"),
          h5("Rate your practice in each of the following areas (1 = low / not implemented, 10 = fully compliant)."),
          sliderInput("q4_pw", "Passwords & Access Management", 1, 10, 5, step = 1),
          sliderInput("q4_mfa", "Multi-Factor Authentication (MFA)", 1, 10, 5, step = 1),
          sliderInput("q4_dev", "Device & Data Protection", 1, 10, 5, step = 1),
          sliderInput("q4_vpn", "Secure Remote Access (VPN use)", 1, 10, 5, step = 1),
          sliderInput("q4_bak", "Data Backup Strategy", 1, 10, 5, step = 1),
          sliderInput("q4_cyb", "Cybersecurity Awareness", 1, 10, 5, step = 1),
          actionBttn("q4_submit", "Submit", color = "success", style = "fill")
        )
      ),
      tabItem(
        tabName = "q4_results",
        fluidPage(
          titlePanel("Digital Security Overview"),
          h4("Average self-ratings across all participants (auto-refresh every 10 seconds)"),
          plotlyOutput("q4_radar", height = "600px")
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
      entries <- unlist(strsplit(txt, "\\s*,\\s*")) # comma-separated phrases
      responses$q1 <- rbind(responses$q1, data.frame(Response = entries))
    }
    updateTextAreaInput(session, "q1_text", value = "")
    updateTabItems(session, "tabs", "q1_results")
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
    responses$q2 <- rbind(responses$q2, all_entries)
    updateTabItems(session, "tabs", "q2_results")
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
          yaxis = list(title = "Frequency"), xaxis = list(title = "Tool")
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
    updateTabItems(session, "tabs", "q3_results")
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
        yaxis = list(title = "Count"), xaxis = list(title = "Tool")
      )
  })

  # ---- Q4 ----
  observeEvent(input$q4_submit, {
    new <- data.frame(
      Passwords = input$q4_pw, MFA = input$q4_mfa, Device = input$q4_dev,
      VPN = input$q4_vpn, Backup = input$q4_bak, Cyber = input$q4_cyb
    )
    responses$q4 <- rbind(responses$q4, new)
    updateTabItems(session, "tabs", "q4_results")
  })

  output$q4_radar <- renderPlotly({
    autoInvalidate()
    if (nrow(responses$q4) == 0) {
      return(NULL)
    }
    avg <- colMeans(responses$q4)
    df <- data.frame(Category = names(avg), Score = as.numeric(avg))
    df <- rbind(df, df[1, ]) # close polygon
    plot_ly(type = "scatterpolar", mode = "lines+fill") %>%
      add_trace(
        r = df$Score, theta = df$Category, fill = "toself",
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
