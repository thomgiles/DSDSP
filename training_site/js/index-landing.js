(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));

  const getSiteData = () => {
    const dataElement = document.getElementById("landing-site-data");
    if (!dataElement) return {courses: [], modules: []};

    try {
      return JSON.parse(dataElement.textContent);
    } catch {
      return {courses: [], modules: []};
    }
  };

  const initLandingCounts = () => {
    const courseTotal = document.getElementById("course-total-count");
    const moduleTotal = document.getElementById("module-total-count");

    const siteData = getSiteData();
    const courses = siteData.courses || [];
    const modules = siteData.modules || [];
    if (courseTotal) courseTotal.textContent = courses.length;
    if (moduleTotal) moduleTotal.textContent = modules.length;
  };

  const initCourseCarousel = () => {
    const carousel = document.getElementById("landing-course-carousel");
    if (!carousel) return;

    const siteData = getSiteData();
    const courses = siteData.courses || [];
    if (!courses.length) return;

    carousel.innerHTML = courses.map((course, index) => {
      const summary = course.summary || course.subtitle || course.intro || "";
      return `
        <a class="landing-course-carousel-card" href="${escapeHtml(course.href)}" data-course-index="${index}" style="--card-delay:${Math.min(index * 90, 360)}ms">
          <span class="landing-card-badge">${escapeHtml(course.area || "Course")}</span>
          <span class="landing-card-status">${escapeHtml(course.badge || course.status || course.level || "")}</span>
          <h3>${escapeHtml(course.title)}</h3>
          <p>${escapeHtml(summary)}</p>
          <span class="landing-card-meta">${escapeHtml(course.level || "Flexible")} · View course</span>
        </a>
      `;
    }).join("");

    const cards = Array.from(carousel.querySelectorAll(".landing-course-carousel-card"));
    const previous = document.querySelector("[data-course-carousel-prev]");
    const next = document.querySelector("[data-course-carousel-next]");
    const dots = document.querySelector("[data-course-carousel-dots]");
    let activeIndex = 0;

    if (dots) {
      dots.innerHTML = courses.map((course, index) => `
        <button type="button" data-course-carousel-dot="${index}" aria-label="Show ${escapeHtml(course.title)}"></button>
      `).join("");
    }

    const dotButtons = dots ? Array.from(dots.querySelectorAll("button")) : [];

    const getOffset = (index) => {
      let offset = index - activeIndex;
      const half = courses.length / 2;
      if (offset > half) offset -= courses.length;
      if (offset < -half) offset += courses.length;
      return offset;
    };

    const setActive = (index) => {
      activeIndex = (index + courses.length) % courses.length;

      cards.forEach((card, cardIndex) => {
        const offset = getOffset(cardIndex);
        const absOffset = Math.abs(offset);
        const visible = absOffset <= 2;
        const scale = offset === 0 ? 1.16 : Math.max(0.7, 0.88 - absOffset * 0.1);
        const translateX = offset * 38;
        const translateZ = offset === 0 ? 190 : (2 - absOffset) * 44;
        const rotateY = offset * -20;
        const opacity = visible ? Math.max(0.34, 1 - absOffset * 0.22) : 0;

        card.classList.toggle("is-active", offset === 0);
        card.setAttribute("aria-hidden", visible ? "false" : "true");
        card.tabIndex = visible ? 0 : -1;
        card.style.zIndex = String(20 - absOffset);
        card.style.opacity = String(opacity);
        card.style.pointerEvents = visible ? "auto" : "none";
        card.style.transform = `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
      });

      dotButtons.forEach((button, index) => {
        const active = index === activeIndex;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-current", active ? "true" : "false");
      });
    };

    previous?.addEventListener("click", () => setActive(activeIndex - 1));
    next?.addEventListener("click", () => setActive(activeIndex + 1));
    dotButtons.forEach((button) => {
      button.addEventListener("click", () => setActive(Number(button.dataset.courseCarouselDot)));
    });
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActive(activeIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActive(activeIndex + 1);
      }
    });

    setActive(0);
  };

  const initKeywordTicker = () => {
    const track = document.querySelector("[data-keyword-ticker]");
    if (!track) return;

    const siteData = getSiteData();
    const courses = siteData.courses || [];
    const modules = siteData.modules || [];
    const fallbackKeywords = [
      "Reproducible workflows",
      "Power Automate",
      "Responsible AI",
      "Python",
      "R",
      "Research data",
      "Collaboration",
      "Open materials"
    ];

    const keywords = [];
    const addKeyword = (value) => {
      const keyword = String(value || "").trim();
      if (!keyword) return;
      const duplicate = keywords.some((existing) => existing.toLowerCase() === keyword.toLowerCase());
      if (!duplicate) keywords.push(keyword);
    };

    courses.forEach((course) => {
      (course.tags || []).forEach(addKeyword);
      addKeyword(course.badge);
      addKeyword(course.area);
    });

    modules.forEach((module) => {
      if (keywords.length >= 24) return;
      addKeyword(module.title);
    });

    const visibleKeywords = (keywords.length ? keywords : fallbackKeywords).slice(0, 24);
    const repeatedKeywords = [...visibleKeywords, ...visibleKeywords];

    track.innerHTML = repeatedKeywords
      .map((keyword) => `<span>${escapeHtml(keyword)}</span>`)
      .join("");
  };

  const initScrollReveals = () => {
    const revealItems = document.querySelectorAll(
      ".landing-programme-summary, .landing-course-carousel-section, .landing-ticker, .landing-research-section, .landing-workshop-section, .landing-credit-banner"
    );
    if (!revealItems.length) return;

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.22 });

    revealItems.forEach((item) => observer.observe(item));
  };

  const initResearchModal = () => {
    const modal = document.getElementById("landing-research-modal");
    const cards = document.querySelectorAll("[data-research-modal]");
    if (!modal || !cards.length) return;

    const modalContent = {
      activities: {
        icon: "🧪",
        title: "Realistic Activities",
        lede: "Activities are designed around the kinds of messy-but-manageable work people recognise from research and professional services settings.",
        points: [
          "Learners practise with plausible data, documents, decisions, and constraints rather than toy examples.",
          "Tasks usually produce a useful artefact: a cleaner folder structure, a working flow, an analysis script, a data check, or a documented decision.",
          "Activities are deliberately scoped so learners can complete them in the room and still have time to inspect, discuss, and improve the result.",
          "Where possible, examples include safe failure points so learners see how to debug, recover, and make better design choices."
        ]
      },
      examples: {
        icon: "♻️",
        title: "Reusable Examples",
        lede: "The training materials are intended to be useful after the session, not just during delivery.",
        points: [
          "Worked examples can be adapted into templates for research projects, admin processes, analysis reports, and teaching materials.",
          "Example data and documents are chosen to demonstrate transferable patterns while avoiding sensitive or project-specific information.",
          "Code, automation steps, and document structures are written so learners can reuse the approach with their own files and systems.",
          "The aim is to leave learners with something concrete they can revisit when the same task appears in real work."
        ]
      },
      guides: {
        icon: "📋",
        title: "Setup and Reference Guides",
        lede: "Learners should not have to rely on memory or screenshots after a workshop finishes.",
        points: [
          "Setup notes help learners prepare accounts, software, permissions, and example files before a practical session starts.",
          "Reference guides capture the key steps, vocabulary, and checks needed to repeat the workflow independently.",
          "Guides separate one-off setup from repeatable practice so learners can find the right instruction quickly.",
          "Where a tool or process has risks, the notes include prompts about ownership, records, access, data protection, and maintainability."
        ]
      },
      instructors: {
        icon: "🎓",
        title: "Instructor Notes",
        lede: "Instructor notes make sessions easier to deliver consistently while still leaving room for discussion and local examples.",
        points: [
          "Notes include suggested timings, teaching prompts, common pitfalls, and points where learners may need extra support.",
          "They help instructors explain why a method matters, not just which buttons to press or which command to run.",
          "Discussion prompts encourage learners to connect the exercise to their own research, governance, and operational contexts.",
          "The notes also make it easier to update materials over time as tools, policies, and learner needs change."
        ]
      }
    };

    const icon = modal.querySelector(".landing-research-modal-icon");
    const title = modal.querySelector("#landing-research-modal-title");
    const lede = modal.querySelector(".landing-research-modal-lede");
    const list = modal.querySelector(".landing-research-modal-list");
    const close = modal.querySelector(".landing-research-modal-close");

    const closeModal = () => {
      if (typeof modal.close === "function") {
        modal.close();
      } else {
        modal.removeAttribute("open");
      }
    };

    const openModal = (key) => {
      const content = modalContent[key];
      if (!content) return;
      icon.textContent = content.icon;
      title.textContent = content.title;
      lede.textContent = content.lede;
      list.innerHTML = content.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("");
      if (typeof modal.showModal === "function") {
        modal.showModal();
      } else {
        modal.setAttribute("open", "");
      }
    };

    cards.forEach((card) => {
      card.addEventListener("click", () => openModal(card.dataset.researchModal));
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openModal(card.dataset.researchModal);
      });
    });

    close?.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
  };

  const initLanding = () => {
    initLandingCounts();
    initCourseCarousel();
    initKeywordTicker();
    initScrollReveals();
    initResearchModal();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLanding);
  } else {
    initLanding();
  }
})();
