class IndexWorkshopRhythm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.ticking = false;
    this.handleViewportMove = this.handleViewportMove.bind(this);
    this.updateScrollState = this.updateScrollState.bind(this);
  }

  connectedCallback() {
    this.render();
    this.section = this.shadowRoot.querySelector(".rhythm-section");
    this.graph = this.shadowRoot.querySelector(".rhythm-graph");
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.observeVisibility();
    this.updateScrollState();

    if (!this.reducedMotion.matches) {
      window.addEventListener("scroll", this.handleViewportMove, { passive: true });
      window.addEventListener("resize", this.handleViewportMove);
    }
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.handleViewportMove);
    window.removeEventListener("resize", this.handleViewportMove);
    if (this.observer) this.observer.disconnect();
  }

  observeVisibility() {
    if (!this.section) return;

    if (!("IntersectionObserver" in window)) {
      this.section.classList.add("is-visible");
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.24 });

    this.observer.observe(this.section);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .rhythm-graph {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: clamp(1rem, 2.6vw, 2rem);
          align-items: stretch;
          min-height: 360px;
          transform:
            perspective(1100px)
            rotateX(var(--rhythm-tilt-x, 0deg))
            rotateY(var(--rhythm-tilt-y, 0deg))
            translateY(var(--rhythm-shift-y, 0px));
          transition: transform 0.18s linear;
          will-change: transform;
        }

        .rhythm-lines {
          position: absolute;
          inset: 0;
          z-index: 1;
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
        }

        .rhythm-path {
          fill: none;
          stroke: rgba(255, 255, 255, 0.54);
          stroke-width: 3;
          stroke-linecap: round;
          stroke-dasharray: 10 8;
          stroke-dashoffset: var(--rhythm-path-offset, 0);
          transition: stroke-dashoffset 0.18s linear;
        }

        .rhythm-arrow {
          fill: rgba(255, 255, 255, 0.7);
        }

        .rhythm-card {
          position: relative;
          z-index: 2;
          display: grid;
          align-content: start;
          gap: 0.85rem;
          min-height: 250px;
          padding: clamp(1.15rem, 2vw, 1.55rem);
          color: #10263b;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.42);
          border-radius: 10px;
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.22);
          opacity: 0;
          transform: translateY(34px) scale(0.96);
          transition:
            opacity 0.75s ease,
            transform 0.75s cubic-bezier(0.18, 0.9, 0.22, 1.12);
        }

        .rhythm-card:nth-of-type(1) { transition-delay: 0.12s, 0.12s; }
        .rhythm-card:nth-of-type(2) { transition-delay: 0.24s, 0.24s; }
        .rhythm-card:nth-of-type(3) { transition-delay: 0.36s, 0.36s; }

        .rhythm-icon {
          display: grid;
          place-items: center;
          width: 4.25rem;
          aspect-ratio: 1;
          border-radius: 18px;
          color: #fff;
          background: linear-gradient(135deg, #298582, #009bc1);
          box-shadow:
            0 14px 30px rgba(0, 103, 129, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.32);
        }

        .rhythm-icon svg {
          width: 78%;
          height: 78%;
          overflow: visible;
        }

        .rhythm-icon .icon-line {
          fill: none;
          stroke: currentColor;
          stroke-width: 5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .rhythm-icon .icon-fill {
          fill: currentColor;
        }

        .rhythm-icon .icon-soft {
          fill: rgba(255, 255, 255, 0.24);
        }

        .rhythm-card h3 {
          margin: 0;
          color: #10263b;
          font-size: clamp(1.28rem, 2vw, 1.7rem);
        }

        .rhythm-card p {
          margin: 0;
          color: rgba(16, 38, 59, 0.76);
          line-height: 1.55;
        }

        .rhythm-section.is-visible .rhythm-card {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        @media (max-width: 900px) {
          .rhythm-graph {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .rhythm-lines {
            display: none;
          }

          .rhythm-card {
            min-height: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rhythm-graph {
            transform: none;
          }

          .rhythm-path {
            stroke-dashoffset: 0;
          }
        }
      </style>

      <div class="rhythm-section">
        <div class="rhythm-graph" aria-label="Workshop rhythm: teach, engage, review">
          <svg class="rhythm-lines" viewBox="0 0 1000 360" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <marker id="rhythm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path class="rhythm-arrow" d="M 0 0 L 10 5 L 0 10 z"></path>
              </marker>
            </defs>
            <path class="rhythm-path" marker-end="url(#rhythm-arrow)" d="M 215 92 C 330 42, 420 42, 500 92"></path>
            <path class="rhythm-path" marker-end="url(#rhythm-arrow)" d="M 500 270 C 615 318, 705 318, 785 270"></path>
            <path class="rhythm-path" marker-end="url(#rhythm-arrow)" d="M 785 105 C 880 32, 930 330, 215 275"></path>
          </svg>

          <article class="rhythm-card">
            <span class="rhythm-icon rhythm-icon-teach" aria-hidden="true">
              <svg viewBox="0 0 96 96" focusable="false">
                <rect class="icon-soft" x="12" y="20" width="72" height="44" rx="8"></rect>
                <path class="icon-line" d="M18 22h60a6 6 0 0 1 6 6v30a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6Z"></path>
                <path class="icon-line" d="M28 76h40"></path>
                <path class="icon-line" d="M48 64v12"></path>
                <path class="icon-line" d="M30 38h20"></path>
                <path class="icon-line" d="M30 50h34"></path>
                <circle class="icon-fill" cx="66" cy="37" r="5"></circle>
              </svg>
            </span>
            <h3>Teach</h3>
            <p>Short periods of directed teaching introduce the concept, vocabulary, and example workflow.</p>
          </article>

          <article class="rhythm-card">
            <span class="rhythm-icon rhythm-icon-engage" aria-hidden="true">
              <svg viewBox="0 0 96 96" focusable="false">
                <path class="icon-soft" d="M16 24h64v42H16z"></path>
                <path class="icon-line" d="M18 22h60a4 4 0 0 1 4 4v36a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V26a4 4 0 0 1 4-4Z"></path>
                <path class="icon-line" d="M30 78h36"></path>
                <path class="icon-line" d="M48 66v12"></path>
                <path class="icon-line" d="M32 45l10 9 22-24"></path>
                <path class="icon-line" d="M22 82c10-11 20-11 30 0"></path>
                <path class="icon-line" d="M44 82c10-11 20-11 30 0"></path>
              </svg>
            </span>
            <h3>Engage</h3>
            <p>Learners complete a hands-on task using realistic data, tools, or decisions from research work.</p>
          </article>

          <article class="rhythm-card">
            <span class="rhythm-icon rhythm-icon-review" aria-hidden="true">
              <svg viewBox="0 0 96 96" focusable="false">
                <path class="icon-soft" d="M16 20h46a10 10 0 0 1 10 10v18a10 10 0 0 1-10 10H42L26 72V58H16a10 10 0 0 1-10-10V30a10 10 0 0 1 10-10Z"></path>
                <path class="icon-line" d="M18 18h42a10 10 0 0 1 10 10v18a10 10 0 0 1-10 10H40L25 70V56h-7A10 10 0 0 1 8 46V28a10 10 0 0 1 10-10Z"></path>
                <path class="icon-line" d="M58 56h10l12 12V56h2a8 8 0 0 0 8-8V36a8 8 0 0 0-8-8h-8"></path>
                <path class="icon-line" d="M26 36h24"></path>
                <path class="icon-line" d="M26 46h14"></path>
                <path class="icon-line" d="M58 74l7 7 15-18"></path>
              </svg>
            </span>
            <h3>Review</h3>
            <p>The room discusses what happened, what changed, and how the idea transfers to real projects.</p>
          </article>
        </div>
      </div>
    `;
  }

  handleViewportMove() {
    if (this.ticking) return;
    this.ticking = true;
    window.requestAnimationFrame(this.updateScrollState);
  }

  updateScrollState() {
    this.ticking = false;
    if (!this.graph) return;

    const rect = this.graph.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const graphCenter = rect.top + rect.height / 2;
    const movement = (viewportCenter - graphCenter) / (window.innerHeight * 0.7);
    const clamped = Math.max(-1, Math.min(1, movement));

    this.graph.style.setProperty("--rhythm-tilt-x", `${(clamped * 3).toFixed(2)}deg`);
    this.graph.style.setProperty("--rhythm-tilt-y", `${(clamped * -5).toFixed(2)}deg`);
    this.graph.style.setProperty("--rhythm-shift-y", `${(clamped * -10).toFixed(2)}px`);
    this.graph.style.setProperty("--rhythm-path-offset", `${(window.scrollY * -0.09).toFixed(2)}`);
  }
}

if (!customElements.get("index-workshop-rhythm")) {
  customElements.define("index-workshop-rhythm", IndexWorkshopRhythm);
}
