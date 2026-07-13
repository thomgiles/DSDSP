(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));

  const uniqueValues = (items, key) => Array.from(
    new Set(items.map((item) => item[key]).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const setOptions = (select, values) => {
    if (!select) return;
    select.innerHTML = `<option value="All">All</option>${values.map((value) =>
      `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`
    ).join("")}`;
  };

  const initCourseModuleFinder = () => {
    const dataElement = document.getElementById("landing-site-data");
    const grid = document.getElementById("landing-module-grid");
    const courseList = document.getElementById("landing-course-list");
    const area = document.getElementById("course-module-area-filter");
    const course = document.getElementById("course-module-course-filter");
    const level = document.getElementById("course-module-level-filter");
    const search = document.getElementById("course-module-search-filter");
    const count = document.getElementById("course-module-match-count");
    const countLabel = document.getElementById("course-module-match-label");
    const courseFilterWrap = document.querySelector("[data-course-filter-wrap]");
    const modeGroup = document.querySelector(".landing-search-mode");
    const modeButtons = Array.from(document.querySelectorAll("[data-search-mode]"));
    const resultViews = Array.from(document.querySelectorAll("[data-results-view]"));

    if (!dataElement || !grid || !courseList || !area || !course || !level || !search || !count || !countLabel || !modeGroup || !modeButtons.length || !resultViews.length) return;

    let siteData = {courses: [], modules: []};
    try {
      siteData = JSON.parse(dataElement.textContent);
    } catch {
      return;
    }

    const courses = siteData.courses || [];
    const modules = siteData.modules || [];
    let activeMode = "courses";

    setOptions(area, uniqueValues(courses, "area"));
    setOptions(course, uniqueValues(modules, "course"));
    setOptions(level, uniqueValues(courses, "level"));

    grid.innerHTML = modules.map((module, index) => `
      <a class="landing-course-card landing-module-card" href="${escapeHtml(module.href)}"
        data-area="${escapeHtml(module.area)}"
        data-level="${escapeHtml(module.level)}"
        data-course="${escapeHtml(module.course)}"
        data-search="${escapeHtml(`${module.title} ${module.course} ${module.area} ${module.level} ${module.icon || ""}`.toLowerCase())}"
        style="--card-delay:${Math.min(index * 35, 280)}ms">
        <span class="landing-card-icon" aria-hidden="true">${escapeHtml(module.icon || "🧩")}</span>
        <span class="landing-card-badge">${escapeHtml(module.course)}</span>
        <span class="landing-module-number">${module.number ? `Module ${escapeHtml(module.number)}` : "Module"}</span>
        <h3>${escapeHtml(module.title)}</h3>
        <p>${escapeHtml(module.course)}</p>
        <span class="landing-card-meta">${escapeHtml(module.area)} · ${escapeHtml(module.level)}</span>
      </a>
    `).join("");

    courseList.innerHTML = courses.map((courseItem, courseIndex) => {
      const glanceItems = courseItem.glance || [];
      return `
        <article class="landing-course-overview-card"
          data-area="${escapeHtml(courseItem.area)}"
          data-level="${escapeHtml(courseItem.level)}"
          data-search="${escapeHtml(`${courseItem.title} ${courseItem.area} ${courseItem.level} ${courseItem.icon || ""} ${courseItem.intro || ""} ${courseItem.summary || ""} ${courseItem.subtitle || ""} ${glanceItems.join(" ")}`.toLowerCase())}"
          style="--card-delay:${Math.min(courseIndex * 60, 240)}ms">
          <span class="landing-card-icon landing-course-overview-icon" aria-hidden="true">${escapeHtml(courseItem.icon || "📚")}</span>
          <div class="landing-course-overview-copy">
            <span class="landing-module-area-kicker">${escapeHtml(courseItem.area)} · ${escapeHtml(courseItem.level)}</span>
            <h3>${escapeHtml(courseItem.title)}</h3>
            <p>${escapeHtml(courseItem.intro || courseItem.summary || courseItem.subtitle)}</p>
          </div>
          <ul class="landing-course-glance-list">
            ${glanceItems.slice(0, 4).map((item) => `
              <li>${escapeHtml(item)}</li>
            `).join("")}
          </ul>
          <a class="landing-card-meta landing-course-overview-link" href="${escapeHtml(courseItem.href)}">View course overview</a>
        </article>
      `;
    }).join("");

    const moduleCards = Array.from(grid.querySelectorAll(".landing-module-card"));
    const courseCards = Array.from(courseList.querySelectorAll(".landing-course-overview-card"));

    const updateFilterOptions = () => {
      const items = activeMode === "courses" ? courses : modules;
      setOptions(area, uniqueValues(items, "area"));
      setOptions(level, uniqueValues(items, "level"));
      area.value = "All";
      level.value = "All";
      course.value = "All";
      if (courseFilterWrap) {
        courseFilterWrap.hidden = activeMode !== "modules";
      }
      search.placeholder = activeMode === "courses" ? "Search courses" : "Search modules";
    };

    const filterCards = () => {
      const searchTerm = search.value.trim().toLowerCase();
      let visible = 0;
      const activeCards = activeMode === "courses" ? courseCards : moduleCards;
      const inactiveCards = activeMode === "courses" ? moduleCards : courseCards;

      inactiveCards.forEach((card) => {
        card.hidden = true;
      });

      activeCards.forEach((card) => {
        const areaMatch = area.value === "All" || card.dataset.area === area.value;
        const courseMatch = activeMode === "courses" || course.value === "All" || card.dataset.course === course.value;
        const levelMatch = level.value === "All" || card.dataset.level === level.value;
        const searchMatch = searchTerm === "" || card.dataset.search.includes(searchTerm);
        const show = areaMatch && courseMatch && levelMatch && searchMatch;
        card.hidden = !show;
        if (show) {
          card.style.setProperty("--card-delay", `${Math.min(visible * 55, 330)}ms`);
          visible += 1;
        }
      });

      count.textContent = visible;
      countLabel.textContent = activeMode === "courses" ? "matching courses" : "matching modules";
      count.parentElement?.classList.remove("is-updating");
      window.requestAnimationFrame(() => {
        count.parentElement?.classList.add("is-updating");
      });
    };

    const updateMode = (mode) => {
      activeMode = mode;
      modeGroup.classList.toggle("is-modules", activeMode === "modules");
      modeButtons.forEach((button) => {
        const selected = button.dataset.searchMode === activeMode;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      resultViews.forEach((view) => {
        const selected = view.dataset.resultsView === activeMode;
        view.hidden = !selected;
        view.classList.toggle("is-active", selected);
      });
      updateFilterOptions();
      filterCards();
    };

    moduleCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    });

    area.addEventListener("change", filterCards);
    course.addEventListener("change", filterCards);
    level.addEventListener("change", filterCards);
    search.addEventListener("input", filterCards);
    modeButtons.forEach((button) => {
      button.addEventListener("click", () => updateMode(button.dataset.searchMode));
    });
    updateMode("courses");
  };

  const showCourseFinderOnLoad = () => {
    document.getElementById("module-finder")?.classList.add("is-visible");
  };

  const initCoursesPage = () => {
    initCourseModuleFinder();
    showCourseFinderOnLoad();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCoursesPage);
  } else {
    initCoursesPage();
  }
})();
