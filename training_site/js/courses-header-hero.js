class CoursesHeaderHero extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.ticking = false;
    this.handleViewportMove = this.handleViewportMove.bind(this);
    this.updateVisual = this.updateVisual.bind(this);
  }

  connectedCallback() {
    this.render();
    this.visual = this.shadowRoot.querySelector(".courses-visual");
    this.stack = this.shadowRoot.querySelector(".course-catalogue-stack");
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.updateVisual();

    if (!this.reducedMotion.matches) {
      window.addEventListener("scroll", this.handleViewportMove, { passive: true });
      window.addEventListener("resize", this.handleViewportMove);
    }
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.handleViewportMove);
    window.removeEventListener("resize", this.handleViewportMove);
  }

  attr(name, fallback = "") {
    return this.getAttribute(name) || fallback;
  }

  escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  render() {
    const heading = this.hasAttribute("heading")
      ? this.escapeHtml(this.attr("heading"))
      : "Courses and<br>Modules";
    const text = this.escapeHtml(this.attr(
      "text",
      "Use the course and module finder to compare topics, levels, and formats, then choose the training that best fits your research needs."
    ));

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: #10263b;
        }

        .hero {
          position: relative;
          width: 100vw;
          min-height: 44vh;
          margin-left: calc(-50vw + 50%);
          overflow: hidden;
          display: flex;
          align-items: center;
          padding:
            clamp(1.8rem, 4vw, 3.2rem)
            max(2rem, calc((100vw - 1160px) / 2))
            clamp(2.8rem, 5.2vw, 4.8rem);
          background: transparent;
          isolation: isolate;
        }

        .copy {
          position: relative;
          z-index: 3;
          max-width: 820px;
        }

        h1,
        ::slotted([slot="heading"]) {
          margin: 0 0 1.25rem;
          max-width: 880px;
          color: #10263b;
          font-size: clamp(1.5rem, 5vw, 4rem);
          font-weight: 700;
          line-height: 0.94;
          letter-spacing: -0.045em;
        }

        .text,
        ::slotted([slot="text"]) {
          max-width: 680px;
          margin: 0;
          color: rgba(16, 38, 59, 0.78);
          font-size: clamp(1.08rem, 2vw, 1.42rem);
          line-height: 1.52;
        }

        .courses-visual {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: visible;
          opacity: 0.42;
          pointer-events: none;
          perspective: 1100px;
        }

        .course-catalogue-stack {
          position: absolute;
          right: max(14vw, 128px);
          top: 50%;
          width: min(40vw, 550px);
          height: min(36vh, 300px);
          transform:
            translateY(-50%)
            rotateX(var(--course-tilt-x, 10deg))
            rotateY(var(--course-tilt-y, -16deg))
            rotateZ(var(--course-tilt-z, 3deg))
            translate3d(var(--course-drift-x, 0px), var(--course-drift-y, 0px), 0);
          transform-origin: 50% 50%;
          transform-style: preserve-3d;
          transition: transform 0.18s linear;
          will-change: transform;
        }

        .course-catalogue-stack::before {
          content: "";
          position: absolute;
          inset: 6% 2% 0 8%;
          border-radius: 30px;
          background:
            radial-gradient(circle at 32% 18%, rgba(0, 155, 193, 0.34), transparent 26%),
            radial-gradient(circle at 78% 72%, rgba(41, 133, 130, 0.28), transparent 34%),
            linear-gradient(135deg, rgba(0, 103, 129, 0.08), transparent 60%);
          filter: blur(1px);
          transform: scale(var(--course-field-scale, 1));
        }

        .course-card {
          position: absolute;
          display: grid;
          gap: 0.5rem;
          width: clamp(128px, 15vw, 188px);
          min-height: clamp(86px, 8.8vw, 112px);
          padding: clamp(0.8rem, 1.45vw, 1.08rem);
          border-radius: 18px;
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.58)),
            linear-gradient(135deg, var(--card-a), var(--card-b));
          border: 1px solid rgba(255, 255, 255, 0.62);
          box-shadow:
            0 20px 38px rgba(16, 38, 59, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.76);
          transform:
            translate(-50%, -50%)
            translate3d(var(--course-card-shift-x, 0px), var(--course-card-shift-y, 0px), var(--card-depth, 40px))
            rotate(var(--card-rotate, 0deg));
          transition: transform 0.18s linear;
          will-change: transform;
        }

        .course-card::before {
          content: "";
          width: 2.6rem;
          height: 0.46rem;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--card-a), var(--card-b));
          box-shadow:
            3.35rem 0 0 rgba(16, 38, 59, 0.12),
            5.2rem 0 0 rgba(16, 38, 59, 0.08);
        }

        .course-card::after {
          content: "";
          align-self: end;
          width: 82%;
          height: 0.42rem;
          border-radius: 999px;
          background: rgba(16, 38, 59, 0.16);
          box-shadow:
            0 0.95rem 0 rgba(16, 38, 59, 0.1),
            0 1.9rem 0 rgba(16, 38, 59, 0.07);
        }

        .course-foundation {
          left: 30%;
          top: 19%;
          --card-a: #009bc1;
          --card-b: #006781;
          --card-depth: 58px;
        }

        .course-extend {
          left: 62%;
          top: 28%;
          --card-a: #298582;
          --card-b: #009bc1;
          --card-depth: 44px;
        }

        .course-analyse {
          left: 69%;
          top: 66%;
          --card-a: #006781;
          --card-b: #10263b;
          --card-depth: 64px;
        }

        .course-reuse {
          left: 34%;
          top: 78%;
          --card-a: #009bc1;
          --card-b: #298582;
          --card-depth: 38px;
        }

        .course-filter-panel {
          position: absolute;
          left: 14%;
          top: 50%;
          width: clamp(142px, 17vw, 214px);
          padding: clamp(0.72rem, 1.3vw, 1rem);
          border-radius: 18px;
          background: linear-gradient(145deg, rgba(16, 38, 59, 0.94), rgba(0, 103, 129, 0.86));
          box-shadow:
            0 22px 42px rgba(16, 38, 59, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transform:
            translate3d(var(--filter-shift-x, 0px), var(--filter-shift-y, 0px), 76px)
            rotate(var(--filter-rotate, -4deg));
          transition: transform 0.18s linear;
          will-change: transform;
        }

        .filter-row {
          display: grid;
          grid-template-columns: 26% 1fr;
          gap: 0.55rem;
          align-items: center;
          margin: 0.55rem 0;
        }

        .filter-row span {
          height: 0.45rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.35);
        }

        .filter-row i {
          display: block;
          height: 0.52rem;
          border-radius: 999px;
          background: linear-gradient(90deg, #009bc1, #298582);
          transform: scaleX(var(--filter-scale, 0.72));
          transform-origin: left;
        }

        .module-slide {
          position: absolute;
          left: 50%;
          top: 50%;
          width: clamp(170px, 20vw, 260px);
          aspect-ratio: 16 / 9;
          display: grid;
          grid-template-rows: auto 1fr;
          gap: clamp(0.5rem, 1vw, 0.76rem);
          padding: clamp(0.72rem, 1.35vw, 1rem);
          border-radius: 18px;
          background:
            radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.82), transparent 26%),
            linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.54)),
            linear-gradient(135deg, #009bc1, #298582);
          border: 1px solid rgba(255, 255, 255, 0.66);
          box-shadow:
            0 24px 44px rgba(16, 38, 59, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.72);
          transform:
            translate(-50%, -50%)
            translate3d(var(--tile-shift-x, 0px), var(--tile-shift-y, 0px), 86px)
            rotate(var(--tile-rotate, 5deg));
          transition: transform 0.18s linear;
          will-change: transform;
        }

        .module-slide::before {
          content: "";
          width: 44%;
          height: 0.48rem;
          border-radius: 999px;
          background: linear-gradient(90deg, #006781, #009bc1);
          box-shadow:
            4.5rem 0 0 rgba(16, 38, 59, 0.1),
            6.3rem 0 0 rgba(16, 38, 59, 0.07);
        }

        .module-slide-body {
          position: relative;
          display: block;
          min-height: 0;
          border-radius: 12px;
          background:
            linear-gradient(rgba(16, 38, 59, 0.16) 0 0) 8% 22% / 66% 0.42rem no-repeat,
            linear-gradient(rgba(16, 38, 59, 0.12) 0 0) 8% 44% / 78% 0.42rem no-repeat,
            linear-gradient(rgba(16, 38, 59, 0.08) 0 0) 8% 66% / 52% 0.42rem no-repeat,
            radial-gradient(circle at 86% 30%, #298582 0 13%, transparent 14%),
            radial-gradient(circle at 78% 66%, #009bc1 0 10%, transparent 11%),
            rgba(255, 255, 255, 0.5);
          transform: translateZ(var(--tile-depth, 24px));
        }

        .module-slide-body::after {
          content: "";
          position: absolute;
          left: 8%;
          right: 8%;
          bottom: 14%;
          height: 0.5rem;
          border-radius: 999px;
          background: linear-gradient(90deg, #009bc1 0 44%, rgba(16, 38, 59, 0.1) 44% 100%);
        }

        .course-spark {
          display: none;
        }

        @media (max-width: 900px) {
          .hero {
            min-height: auto;
            padding: 3.2rem 1.5rem;
          }

          .courses-visual {
            opacity: 0.3;
          }

          .course-catalogue-stack {
            right: -30vw;
            width: min(112vw, 660px);
            height: 360px;
            transform:
              translateY(-66%)
              scale(0.72)
              rotateX(var(--course-tilt-x, 10deg))
              rotateY(var(--course-tilt-y, -16deg))
              rotateZ(var(--course-tilt-z, 3deg));
          }
        }
      </style>

      <section class="hero">
        <div class="copy">
          <slot name="heading"><h1>${heading}</h1></slot>
          <slot name="text"><p class="text">${text}</p></slot>
        </div>
        <div class="courses-visual" aria-hidden="true">
          <div class="course-catalogue-stack">
            <article class="course-card course-foundation"></article>
            <article class="course-card course-extend"></article>
            <article class="course-card course-analyse"></article>
            <article class="course-card course-reuse"></article>
            <div class="module-slide">
              <span class="module-slide-body"></span>
            </div>
            <div class="course-filter-panel">
              <span class="filter-row"><span></span><i></i></span>
              <span class="filter-row"><span></span><i></i></span>
              <span class="filter-row"><span></span><i></i></span>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  handleViewportMove() {
    if (this.ticking) return;
    this.ticking = true;
    window.requestAnimationFrame(this.updateVisual);
  }

  updateVisual() {
    this.ticking = false;
    if (!this.visual || !this.stack) return;

    const rect = this.visual.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const visualCenter = rect.top + rect.height / 2;
    const movement = (viewportCenter - visualCenter) / (window.innerHeight * 0.68);
    const clamped = Math.max(-1, Math.min(1, movement));

    this.stack.style.setProperty("--course-tilt-x", `${(10 + clamped * 14).toFixed(2)}deg`);
    this.stack.style.setProperty("--course-tilt-y", `${(-16 + clamped * 36).toFixed(2)}deg`);
    this.stack.style.setProperty("--course-tilt-z", `${(3 + clamped * -12).toFixed(2)}deg`);
    this.stack.style.setProperty("--course-drift-x", `${(clamped * 32).toFixed(2)}px`);
    this.stack.style.setProperty("--course-drift-y", `${(clamped * -18).toFixed(2)}px`);
    this.stack.style.setProperty("--course-field-scale", `${(1 + Math.abs(clamped) * 0.1).toFixed(3)}`);
    this.stack.style.setProperty("--course-card-shift-x", `${(clamped * -16).toFixed(2)}px`);
    this.stack.style.setProperty("--course-card-shift-y", `${(clamped * 14).toFixed(2)}px`);
    this.stack.style.setProperty("--card-rotate", `${(clamped * 8).toFixed(2)}deg`);
    this.stack.style.setProperty("--filter-shift-x", `${(clamped * 28).toFixed(2)}px`);
    this.stack.style.setProperty("--filter-shift-y", `${(clamped * -20).toFixed(2)}px`);
    this.stack.style.setProperty("--filter-rotate", `${(-4 + clamped * -16).toFixed(2)}deg`);
    this.stack.style.setProperty("--filter-scale", `${(0.72 + Math.abs(clamped) * 0.18).toFixed(3)}`);
    this.stack.style.setProperty("--tile-shift-x", `${(clamped * -24).toFixed(2)}px`);
    this.stack.style.setProperty("--tile-shift-y", `${(clamped * 20).toFixed(2)}px`);
    this.stack.style.setProperty("--tile-rotate", `${(5 + clamped * 16).toFixed(2)}deg`);
    this.stack.style.setProperty("--tile-depth", `${(24 + Math.abs(clamped) * 16).toFixed(2)}px`);
  }
}

if (!customElements.get("courses-header-hero")) {
  customElements.define("courses-header-hero", CoursesHeaderHero);
}

function mountCoursesHeaderHero() {
  if (document.querySelector("courses-header-hero")) return;

  const main = document.querySelector("main#quarto-document-content") || document.body;
  const hero = document.createElement("courses-header-hero");
  main.insertBefore(hero, main.firstChild);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountCoursesHeaderHero);
} else {
  mountCoursesHeaderHero();
}
