class ServicesHeaderHero extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.ticking = false;
    this.handleViewportMove = this.handleViewportMove.bind(this);
    this.updateVisual = this.updateVisual.bind(this);
  }

  connectedCallback() {
    this.render();
    this.stage = this.shadowRoot.querySelector(".services-stage");
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

    this.stage.style.setProperty("--services-x", `${(8 + centred * 20).toFixed(2)}deg`);
    this.stage.style.setProperty("--services-y", `${(-18 + centred * -34).toFixed(2)}deg`);
    this.stage.style.setProperty("--services-z", `${(centred * 8).toFixed(2)}deg`);
    this.stage.style.setProperty("--services-dx", `${(centred * 58).toFixed(1)}px`);
    this.stage.style.setProperty("--services-dy", `${(centred * -28).toFixed(1)}px`);
    this.stage.style.setProperty("--service-path-offset", `${(440 - progress * 880).toFixed(1)}`);
    this.stage.style.setProperty("--service-node-scale", `${(0.94 + progress * 0.12).toFixed(3)}`);
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
          max-width: 790px;
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

        .services-stage {
          position: absolute;
          right: max(12vw, 90px);
          top: 50%;
          width: min(46vw, 620px);
          height: min(37vh, 340px);
          transform:
            translateY(-50%)
            translate3d(var(--services-dx, 0px), var(--services-dy, 0px), 0)
            rotateX(var(--services-x, 8deg))
            rotateY(var(--services-y, -18deg))
            rotateZ(var(--services-z, 0deg));
          transform-style: preserve-3d;
          transition: transform 0.18s linear;
          will-change: transform;
        }

        .service-field {
          position: absolute;
          inset: 6% 4% 2% 3%;
          border-radius: 36px;
          background:
            radial-gradient(circle at 20% 24%, rgba(0, 155, 193, 0.26), transparent 30%),
            radial-gradient(circle at 78% 70%, rgba(41, 133, 130, 0.26), transparent 34%),
            linear-gradient(135deg, rgba(16, 38, 59, 0.08), rgba(0, 103, 129, 0.06));
          transform: translateZ(-10px) scale(var(--service-node-scale, 1));
        }

        .service-node {
          position: absolute;
          display: grid;
          place-items: center;
          width: clamp(104px, 11vw, 150px);
          min-height: clamp(76px, 7.8vw, 102px);
          padding: 0.8rem;
          border-radius: 18px;
          color: #10263b;
          text-align: center;
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.97), rgba(255, 255, 255, 0.62));
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow:
            0 22px 44px rgba(16, 38, 59, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transform:
            translate(-50%, -50%)
            translate3d(var(--node-dx, 0px), var(--node-dy, 0px), var(--node-z, 60px))
            rotate(var(--node-r, 0deg))
            scale(var(--service-node-scale, 1));
          transition: transform 0.18s linear;
          will-change: transform;
        }

        .service-node strong {
          display: block;
          font: 800 clamp(0.78rem, 1.2vw, 0.94rem)/1.15 sans-serif;
        }

        .service-node::before {
          content: "";
          display: block;
          width: 2.3rem;
          height: 0.42rem;
          margin-bottom: 0.6rem;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--node-a), var(--node-b));
          box-shadow: 3rem 0 0 rgba(16, 38, 59, 0.1);
        }

        .hub {
          left: 50%;
          top: 50%;
          width: clamp(150px, 15vw, 210px);
          min-height: clamp(104px, 10vw, 142px);
          color: #ffffff;
          background:
            radial-gradient(circle at 28% 20%, rgba(255, 255, 255, 0.28), transparent 28%),
            linear-gradient(135deg, #10263b, #006781);
          --node-a: #009bc1;
          --node-b: #298582;
          --node-z: 136px;
        }

        .consult {
          left: 24%;
          top: 25%;
          --node-a: #009bc1;
          --node-b: #006781;
          --node-z: 92px;
          --node-r: -5deg;
        }

        .materials {
          left: 74%;
          top: 24%;
          --node-a: #298582;
          --node-b: #009bc1;
          --node-z: 104px;
          --node-r: 4deg;
        }

        .collaborate {
          left: 76%;
          top: 74%;
          --node-a: #006781;
          --node-b: #10263b;
          --node-z: 82px;
          --node-r: -3deg;
        }

        .clinics {
          left: 24%;
          top: 76%;
          --node-a: #009bc1;
          --node-b: #298582;
          --node-z: 74px;
          --node-r: 5deg;
        }

        .path-layer {
          position: absolute;
          inset: 0;
          transform: translateZ(112px);
        }

        svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .service-path {
          fill: none;
          stroke: #006781;
          stroke-width: 2.25;
          stroke-linecap: round;
          stroke-dasharray: 7 10;
          stroke-dashoffset: var(--service-path-offset, 0);
          filter: drop-shadow(0 8px 18px rgba(0, 103, 129, 0.18));
          transition: stroke-dashoffset 0.18s linear;
        }

        .service-pulse {
          fill: #009bc1;
          opacity: 0.9;
          filter: drop-shadow(0 0 16px rgba(0, 155, 193, 0.46));
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
            opacity: 0.2;
          }

          .services-stage {
            right: -124px;
            width: 660px;
            height: 360px;
          }
        }
      </style>

      <section class="hero" aria-label="Training services">
        <div class="copy">
          <h1>Training Services</h1>
        </div>
        <div class="visual" aria-hidden="true">
          <div class="services-stage">
            <div class="service-field"></div>
            <div class="path-layer">
              <svg viewBox="0 0 620 340">
                <path class="service-path" d="M310 170 C245 120 205 88 149 85"/>
                <path class="service-path" d="M310 170 C382 112 420 88 459 82"/>
                <path class="service-path" d="M310 170 C392 222 432 250 471 252"/>
                <path class="service-path" d="M310 170 C226 222 184 250 148 258"/>
                <circle class="service-pulse" cx="310" cy="170" r="6"/>
                <circle class="service-pulse" cx="459" cy="82" r="4"/>
                <circle class="service-pulse" cx="148" cy="258" r="4"/>
              </svg>
            </div>
            <div class="service-node hub"></div>
            <div class="service-node consult"></div>
            <div class="service-node materials"></div>
            <div class="service-node collaborate"></div>
            <div class="service-node clinics"></div>
          </div>
        </div>
      </section>
    `;
  }
}

customElements.define("services-header-hero", ServicesHeaderHero);
