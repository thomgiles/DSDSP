class IndexHeaderHero extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.ticking = false;
    this.handleViewportMove = this.handleViewportMove.bind(this);
    this.updateAxis = this.updateAxis.bind(this);
  }

  connectedCallback() {
    this.render();
    this.visual = this.shadowRoot.querySelector(".visual");
    this.orbitSystem = this.shadowRoot.querySelector(".network-stage");
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.updateAxis();

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
    const eyebrow = this.escapeHtml(this.attr("eyebrow", "Digital Research Service"));
    const eyebrowHref = this.escapeHtml(this.attr("eyebrow-href", "#"));
    const heading = this.hasAttribute("heading")
      ? this.escapeHtml(this.attr("heading"))
      : "Digital Skills for<br>Modern Research";
    const text = this.escapeHtml(this.attr(
      "text",
      "Build practical confidence with research data, automation, analysis, digital collaboration, and responsible AI."
    ));

    const nodes = [
      { className: "node-data", x: 72, y: 18 },
      { className: "node-automation", x: 86, y: 43 },
      { className: "node-ai", x: 70, y: 72 },
      { className: "node-python", x: 42, y: 82 },
      { className: "node-r", x: 22, y: 63 },
      { className: "node-reporting", x: 21, y: 34 },
      { className: "node-collaboration", x: 44, y: 16 },
      { className: "node-open", x: 58, y: 52 }
    ];

    const arcs = nodes.map((node, index) => {
      const dx = node.x - 50;
      const dy = node.y - 50;
      const bend = index % 2 === 0 ? 7 : -7;
      const controlX = 50 + dx * 0.46 - dy * 0.08;
      const controlY = 50 + dy * 0.46 + bend;

      const packetX = 50 + (node.x - 50) * 0.62;
      const packetY = 50 + (node.y - 50) * 0.62;

      return `
        <path class="network-arc arc-${index}" id="data-arc-${index}" d="M 50 50 Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${node.x} ${node.y}" />
        <circle class="data-packet packet-${index}" cx="${packetX.toFixed(1)}" cy="${packetY.toFixed(1)}" r="0.85" />
      `;
    }).join("");

    const nodeMarkup = nodes.map((node) => `
      <div class="network-node ${node.className}" style="--node-x: ${node.x}; --node-y: ${node.y};">
        <span class="node-dot"></span>
      </div>
    `).join("");

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: #10263b;
        }

        .hero {
          position: relative;
          width: 100vw;
          min-height: 74vh;
          margin-left: calc(-50vw + 50%);
          overflow: hidden;
          display: flex;
          align-items: center;
          padding:
            clamp(2.2rem, 4.5vw, 4rem)
            max(2rem, calc((100vw - 1160px) / 2))
            clamp(4.8rem, 8vw, 8.2rem);
          background: transparent;
          isolation: isolate;
        }

        .hero::before,
        .hero::after {
          display: none;
        }

        .hero::before {
          inset: auto auto -24% -10%;
        }

        .hero::after {
          inset: -34% -18% auto auto;
          width: 46vw;
          background: radial-gradient(circle, rgba(41, 133, 130, 0.55), transparent 62%);
        }

        .copy {
          position: relative;
          z-index: 3;
          max-width: 820px;
        }

        .eyebrow,
        ::slotted([slot="eyebrow"]) {
          display: inline-flex;
          align-items: center;
          max-width: min(100%, 760px);
          min-height: 2.2rem;
          margin: 0 0 1.25rem;
          padding: 0.45rem 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.55);
          border-radius: 999px;
          background: #298582;
          color: #fff;
          font-size: 0.84rem;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
        }

        h1,
        ::slotted([slot="heading"]) {
          margin: 0 0 1.25rem;
          max-width: 880px;
          color: #10263b;
          font-size: clamp(1.5rem, 5vw, 4rem);
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

        .actions {
          display: none;
        }

        .button,
        ::slotted([slot="primary"]),
        ::slotted([slot="secondary"]) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 3rem;
          padding: 0.78rem 1.1rem;
          border-radius: 8px;
          font-weight: 800;
          text-decoration: none;
          transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }

        .button:hover,
        ::slotted([slot="primary"]:hover),
        ::slotted([slot="secondary"]:hover) {
          transform: translateY(-2px);
        }

        .primary,
        ::slotted([slot="primary"]) {
          color: #fff;
          background: #298582;
          border: 1px solid #298582;
        }

        .secondary,
        ::slotted([slot="secondary"]) {
          color: #10263b;
          background: transparent;
          border: 1px solid rgba(16, 38, 59, 0.28);
        }

        .visual {
          position: absolute;
          inset: 0;
          z-index: 1;
          min-height: 100%;
          overflow: visible;
          background: transparent;
          border: 0;
          border-radius: 0;
          box-shadow: none;
          backdrop-filter: none;
          perspective: 1050px;
          opacity: 0.5;
          pointer-events: none;
        }

        .network-stage {
          position: absolute;
          left: 50%;
          top: 50%;
          width: min(56vw, 720px);
          height: min(62vh, 520px);
          transform: translate(-100px, -200px) scale(2) rotateX(var(--tilt-x, 4deg)) rotateY(var(--tilt-y, -8deg)) rotateZ(var(--tilt-z, -2deg));
          transform-origin: 50% 50%;
          transform-style: preserve-3d;
          transition: transform 0.18s linear;
          will-change: transform;
        }

        .network-stage::before,
        .network-stage::after {
          content: "";
          position: absolute;
          border-radius: 999px;
          filter: blur(2px);
          opacity: 0.56;
          pointer-events: none;
        }

        .network-stage::before {
          inset: 14% 7% 10% 18%;
          background: radial-gradient(circle at 50% 50%, rgba(0, 155, 193, 0.22), transparent 68%);
          transform: scale(var(--field-scale, 1));
        }

        .network-stage::after {
          inset: 4% 24% 16% 2%;
          border: 1px solid rgba(0, 103, 129, 0.16);
          transform: rotate(-15deg);
        }

        .network-map {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: visible;
          filter:
            drop-shadow(0 12px 24px rgba(16, 38, 59, 0.1))
            drop-shadow(0 0 18px rgba(0, 155, 193, 0.18));
        }

        .network-arc {
          fill: none;
          stroke: url(#network-gradient);
          stroke-width: 0.48;
          stroke-linecap: round;
          stroke-dasharray: 2.8 4.2;
          stroke-dashoffset: var(--arc-offset, 0);
          opacity: 0.62;
        }

        .arc-1,
        .arc-4,
        .arc-6 {
          animation-duration: 13s;
          opacity: 0.5;
        }

        .data-packet {
          fill: #009bc1;
          opacity: 0.95;
          filter: drop-shadow(0 0 4px rgba(0, 155, 193, 0.85));
          transform: translate(var(--packet-shift-x, 0px), var(--packet-shift-y, 0px));
          transition: transform 0.18s linear;
        }

        .packet-1,
        .packet-4,
        .packet-6 {
          fill: #298582;
        }

        .network-globe {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 3;
          translate: -50% -50%;
          width: clamp(86px, 13vw, 152px);
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 50%;
          background:
            radial-gradient(circle at 34% 26%, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.24) 14%, transparent 28%),
            radial-gradient(circle at 68% 68%, rgba(16, 38, 59, 0.26), transparent 54%),
            linear-gradient(135deg, rgba(0, 155, 193, 0.94), rgba(41, 133, 130, 0.92));
          box-shadow:
            0 0 34px rgba(0, 155, 193, 0.35),
            inset -18px -14px 28px rgba(16, 38, 59, 0.28),
            inset 12px 10px 18px rgba(255, 255, 255, 0.28);
          transform: rotateY(calc(var(--tilt-y, -8deg) * -1)) rotateX(calc(var(--tilt-x, 4deg) * -1));
          transform-style: preserve-3d;
        }

        .network-globe::before,
        .network-globe::after {
          content: "";
          position: absolute;
          inset: 10%;
          border-radius: 50%;
          pointer-events: none;
        }

        .network-globe::before {
          background:
            repeating-linear-gradient(
              90deg,
              transparent 0 15px,
              rgba(255, 255, 255, 0.38) 16px 17px,
              transparent 18px 32px
            ),
            repeating-linear-gradient(
              0deg,
              transparent 0 17px,
              rgba(255, 255, 255, 0.28) 18px 19px,
              transparent 20px 35px
          );
          mask-image: radial-gradient(circle, #000 66%, transparent 68%);
          transform: rotateY(var(--globe-spin, 0deg)) rotateZ(-8deg);
          will-change: transform;
        }

        .network-globe::after {
          inset: 0;
          background:
            radial-gradient(circle at 72% 70%, rgba(16, 38, 59, 0.36), transparent 46%),
            linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.16), transparent);
          mix-blend-mode: screen;
        }

        .globe-map {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background:
            radial-gradient(ellipse at 22% 44%, rgba(255, 255, 255, 0.48) 0 8%, transparent 9%),
            radial-gradient(ellipse at 48% 35%, rgba(255, 255, 255, 0.42) 0 11%, transparent 12%),
            radial-gradient(ellipse at 62% 62%, rgba(255, 255, 255, 0.36) 0 10%, transparent 11%),
            radial-gradient(ellipse at 84% 46%, rgba(255, 255, 255, 0.34) 0 7%, transparent 8%);
          transform: rotateY(var(--globe-spin, 0deg)) rotateZ(-6deg);
          will-change: transform;
          opacity: 0.82;
        }

        .network-node {
          position: absolute;
          left: calc(var(--node-x) * 1%);
          top: calc(var(--node-y) * 1%);
          z-index: 4;
          display: grid;
          place-items: center;
          width: clamp(16px, 2vw, 24px);
          aspect-ratio: 1;
          transform: translate(-50%, -50%) translate3d(var(--node-shift-x, 0px), var(--node-shift-y, 0px), 38px);
          will-change: transform;
        }

        .node-dot {
          width: 0.72rem;
          aspect-ratio: 1;
          border-radius: 50%;
          background: #009bc1;
          box-shadow: 0 0 0 5px rgba(0, 155, 193, 0.14), 0 0 16px rgba(0, 155, 193, 0.52);
        }

        .node-automation .node-dot,
        .node-open .node-dot,
        .node-r .node-dot {
          background: #298582;
          box-shadow: 0 0 0 5px rgba(41, 133, 130, 0.14), 0 0 16px rgba(41, 133, 130, 0.5);
        }

        .node-python .node-dot,
        .node-reporting .node-dot {
          background: #006781;
          box-shadow: 0 0 0 5px rgba(0, 103, 129, 0.14), 0 0 16px rgba(0, 103, 129, 0.42);
        }

        .data-sheen {
          position: absolute;
          inset: 0;
          z-index: 2;
          background:
            linear-gradient(105deg, transparent 0 42%, rgba(255, 255, 255, 0.22) 48%, transparent 54%),
            radial-gradient(circle at 66% 34%, rgba(0, 155, 193, 0.12), transparent 22%);
          mix-blend-mode: screen;
          transform: translateX(var(--sheen-x, -18%));
        }

        @media (max-width: 900px) {
          .hero {
            min-height: auto;
            padding: 4.2rem 1.5rem;
          }

          .visual {
            opacity: 0.35;
          }

          .network-stage {
            width: min(94vw, 620px);
            height: 400px;
            transform: translate(18vw, -210px) scale(0.76) rotateX(var(--tilt-x, 4deg)) rotateY(var(--tilt-y, -8deg)) rotateZ(var(--tilt-z, -2deg));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .button:hover {
            transform: none;
          }

          .network-stage {
            transform: translate(250px, -260px) scale(1);
          }
        }
      </style>

      <section class="hero">
        <div class="copy">
          <slot name="eyebrow"></slot>
          <slot name="heading"><h1>${heading}</h1></slot>
          <slot name="text"><p class="text">${text}</p></slot>
        </div>
        <div class="visual" aria-hidden="true">
          <div class="network-stage">
            <svg class="network-map" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="network-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#009bc1" stop-opacity="0.32"></stop>
                  <stop offset="52%" stop-color="#006781" stop-opacity="0.74"></stop>
                  <stop offset="100%" stop-color="#298582" stop-opacity="0.38"></stop>
                </linearGradient>
              </defs>
              ${arcs}
            </svg>
            <div class="network-globe"><span class="globe-map"></span></div>
            ${nodeMarkup}
            <div class="data-sheen"></div>
          </div>
        </div>
      </section>
    `;
  }

  handleViewportMove() {
    if (this.ticking) return;
    this.ticking = true;
    window.requestAnimationFrame(this.updateAxis);
  }

  updateAxis() {
    this.ticking = false;
    if (!this.visual || !this.orbitSystem) return;

    const rect = this.visual.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const visualCenter = rect.top + rect.height / 2;
    const movement = (viewportCenter - visualCenter) / (window.innerHeight * 0.65);
    const clamped = Math.max(-1, Math.min(1, movement));
    const tiltX = 4 + clamped * 7;
    const tiltY = -8 + clamped * 14;
    const tiltZ = -2 + clamped * -4;
    const nodeShiftX = clamped * 12;
    const nodeShiftY = clamped * -10;
    const sheenX = -18 + clamped * 28;
    const fieldScale = 1 + Math.abs(clamped) * 0.08;
    const arcOffset = window.scrollY * -0.08;
    const packetShiftX = clamped * 7;
    const packetShiftY = clamped * -5;
    const globeSpin = window.scrollY * 0.48;

    this.orbitSystem.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    this.orbitSystem.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
    this.orbitSystem.style.setProperty("--tilt-z", `${tiltZ.toFixed(2)}deg`);
    this.orbitSystem.style.setProperty("--node-shift-x", `${nodeShiftX.toFixed(2)}px`);
    this.orbitSystem.style.setProperty("--node-shift-y", `${nodeShiftY.toFixed(2)}px`);
    this.orbitSystem.style.setProperty("--sheen-x", `${sheenX.toFixed(2)}%`);
    this.orbitSystem.style.setProperty("--field-scale", fieldScale.toFixed(3));
    this.orbitSystem.style.setProperty("--arc-offset", `${arcOffset.toFixed(2)}`);
    this.orbitSystem.style.setProperty("--packet-shift-x", `${packetShiftX.toFixed(2)}px`);
    this.orbitSystem.style.setProperty("--packet-shift-y", `${packetShiftY.toFixed(2)}px`);
    this.orbitSystem.style.setProperty("--globe-spin", `${globeSpin.toFixed(2)}deg`);
  }
}

if (!customElements.get("index-header-hero")) {
  customElements.define("index-header-hero", IndexHeaderHero);
}

function mountIndexHeaderHero() {
  if (document.querySelector("index-header-hero")) return;

  const main = document.querySelector("main#quarto-document-content") || document.body;
  const hero = document.createElement("index-header-hero");
  main.insertBefore(hero, main.firstChild);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountIndexHeaderHero);
} else {
  mountIndexHeaderHero();
}
