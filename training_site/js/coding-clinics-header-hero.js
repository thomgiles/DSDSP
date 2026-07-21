class CodingClinicsHeaderHero extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.ticking = false;
    this.handleViewportMove = this.handleViewportMove.bind(this);
    this.updateVisual = this.updateVisual.bind(this);
  }

  connectedCallback() {
    this.render();
    this.stage = this.shadowRoot.querySelector(".clinic-stage");
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

  handleViewportMove() {
    if (this.ticking) return;
    this.ticking = true;
    window.requestAnimationFrame(this.updateVisual);
  }

  updateVisual() {
    this.ticking = false;
    if (!this.stage) return;

    const rect = this.getBoundingClientRect();
    const height = Math.max(window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, (height - rect.top) / (height + rect.height)));
    const centred = progress - 0.5;

    this.stage.style.setProperty("--clinic-x", `${(centred * 16).toFixed(2)}deg`);
    this.stage.style.setProperty("--clinic-y", `${(-10 + centred * -30).toFixed(2)}deg`);
    this.stage.style.setProperty("--clinic-z", `${(centred * 5).toFixed(2)}deg`);
    this.stage.style.setProperty("--clinic-dx", `${(centred * 46).toFixed(1)}px`);
    this.stage.style.setProperty("--clinic-dy", `${(centred * -30).toFixed(1)}px`);
    this.stage.style.setProperty("--path-offset", `${(260 - progress * 520).toFixed(1)}`);
    this.stage.style.setProperty("--pulse-scale", `${(0.92 + progress * 0.16).toFixed(3)}`);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: #10263b;
        }

        .hero {
          position: relative;
          width: 100vw;
          min-height: 48vh;
          margin-left: calc(-50vw + 50%);
          overflow: hidden;
          display: flex;
          align-items: center;
          padding:
            clamp(2rem, 4vw, 3.6rem)
            max(2rem, calc((100vw - 1160px) / 2))
            clamp(3.2rem, 5.5vw, 5rem);
          background: transparent;
          isolation: isolate;
        }

        .copy {
          position: relative;
          z-index: 3;
          max-width: 780px;
        }

        h1 {
          margin: 0 0 1.25rem;
          max-width: 820px;
          color: #10263b;
          font-size: clamp(1.8rem, 5vw, 4rem);
          font-weight: 700;
          line-height: 0.94;
          letter-spacing: -0.045em;
        }

        .visual {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0.48;
          pointer-events: none;
          perspective: 1100px;
          overflow: visible;
        }

        .clinic-stage {
          position: absolute;
          right: max(12vw, 92px);
          top: 50%;
          width: min(46vw, 610px);
          height: min(36vh, 330px);
          transform:
            translateY(-50%)
            translate3d(var(--clinic-dx, 0px), var(--clinic-dy, 0px), 0)
            rotateX(var(--clinic-x, 0deg))
            rotateY(var(--clinic-y, -10deg))
            rotateZ(var(--clinic-z, 0deg));
          transform-style: preserve-3d;
          transition: transform 0.18s linear;
          will-change: transform;
        }

        .clinic-field {
          position: absolute;
          inset: 7% 5% 1% 3%;
          border-radius: 34px;
          background:
            radial-gradient(circle at 20% 28%, rgba(0, 155, 193, 0.25), transparent 30%),
            radial-gradient(circle at 82% 68%, rgba(41, 133, 130, 0.28), transparent 34%),
            linear-gradient(135deg, rgba(16, 38, 59, 0.08), rgba(0, 103, 129, 0.05));
          transform: translateZ(-8px) scale(var(--pulse-scale, 1));
        }

        .code-card,
        .mentor-card,
        .learner-card,
        .outcome-card {
          position: absolute;
          border-radius: 16px;
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.62));
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow:
            0 22px 44px rgba(16, 38, 59, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .code-card {
          left: 8%;
          top: 20%;
          width: clamp(190px, 20vw, 270px);
          padding: 1rem;
          transform: translateZ(72px) rotate(-4deg);
        }

        .code-line {
          display: block;
          height: 0.52rem;
          margin: 0.58rem 0;
          border-radius: 999px;
          background: rgba(16, 38, 59, 0.16);
        }

        .code-line:nth-child(1) { width: 54%; background: #006781; }
        .code-line:nth-child(2) { width: 78%; }
        .code-line:nth-child(3) { width: 68%; background: rgba(0, 155, 193, 0.38); }
        .code-line:nth-child(4) { width: 88%; }
        .code-line:nth-child(5) { width: 46%; background: rgba(41, 133, 130, 0.48); }

        .mentor-card {
          left: 48%;
          top: 9%;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.55rem;
          align-items: center;
          width: clamp(150px, 16vw, 210px);
          padding: 0.9rem;
          transform: translateZ(110px) rotate(3deg);
        }

        .learner-card {
          left: 55%;
          top: 56%;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.55rem;
          align-items: center;
          width: clamp(160px, 17vw, 220px);
          padding: 0.9rem;
          transform: translateZ(92px) rotate(-2deg);
        }

        .outcome-card {
          right: 4%;
          top: 38%;
          width: clamp(148px, 15vw, 204px);
          padding: 1rem;
          transform: translateZ(56px) rotate(5deg);
        }

        .avatar {
          display: grid;
          place-items: center;
          width: 42px;
          aspect-ratio: 1;
          border-radius: 12px;
          color: #ffffff;
          background: linear-gradient(135deg, #006781, #298582);
          font-size: 1.35rem;
        }

        .mini-line {
          display: block;
          height: 0.46rem;
          margin: 0.34rem 0;
          border-radius: 999px;
          background: rgba(16, 38, 59, 0.14);
        }

        .mini-line:first-child {
          width: 72%;
          background: #009bc1;
        }

        .mini-line:last-child {
          width: 52%;
        }

        .outcome-card strong {
          display: block;
          margin-bottom: 0.7rem;
          color: #10263b;
          font: 800 0.95rem/1.1 sans-serif;
        }

        .path {
          position: absolute;
          inset: 0;
          transform: translateZ(126px);
        }

        svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .clinic-path {
          fill: none;
          stroke: #006781;
          stroke-width: 2.4;
          stroke-linecap: round;
          stroke-dasharray: 8 10;
          stroke-dashoffset: var(--path-offset, 0);
          filter: drop-shadow(0 8px 18px rgba(0, 103, 129, 0.18));
          transition: stroke-dashoffset 0.18s linear;
        }

        .pulse {
          fill: #009bc1;
          opacity: 0.9;
          transform-origin: center;
          transform-box: fill-box;
          scale: var(--pulse-scale, 1);
          filter: drop-shadow(0 0 16px rgba(0, 155, 193, 0.48));
        }

        @media (max-width: 760px) {
          .hero {
            min-height: 56vh;
            padding-top: 2rem;
          }

          .copy {
            max-width: 92vw;
          }

          .visual {
            opacity: 0.22;
          }

          .clinic-stage {
            right: -118px;
            width: 640px;
            height: 340px;
          }
        }
      </style>

      <section class="hero" aria-label="Coding Clinics">
        <div class="copy">
          <h1>Personalised Engagement Clinics</h1>
        </div>
        <div class="visual" aria-hidden="true">
          <div class="clinic-stage">
            <div class="clinic-field"></div>
            <div class="path">
              <svg viewBox="0 0 610 330">
                <path class="clinic-path" d="M155 126 C250 58 328 88 390 130 C456 176 500 168 548 142"/>
                <path class="clinic-path" d="M186 192 C278 276 372 254 432 210 C470 182 506 176 548 182"/>
                <circle class="pulse" cx="385" cy="130" r="7"/>
                <circle class="pulse" cx="432" cy="210" r="5"/>
              </svg>
            </div>
            <div class="code-card">
              <span class="code-line"></span>
              <span class="code-line"></span>
              <span class="code-line"></span>
              <span class="code-line"></span>
              <span class="code-line"></span>
            </div>
            <div class="mentor-card">
              <span class="avatar"></span>
              <span>
                <i class="mini-line"></i>
                <i class="mini-line"></i>
              </span>
            </div>
            <div class="learner-card">
              <span class="avatar"></span>
              <span>
                <i class="mini-line"></i>
                <i class="mini-line"></i>
              </span>
            </div>
            <div class="outcome-card">
              <span class="mini-line"></span>
              <span class="mini-line"></span>
              <span class="mini-line"></span>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}

customElements.define("coding-clinics-header-hero", CodingClinicsHeaderHero);
