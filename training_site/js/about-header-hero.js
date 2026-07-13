class AboutHeaderHero extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.ticking = false;
    this.handleViewportMove = this.handleViewportMove.bind(this);
    this.updateVisual = this.updateVisual.bind(this);
  }

  connectedCallback() {
    this.render();
    this.visual = this.shadowRoot.querySelector(".recycle-visual");
    this.symbol = this.shadowRoot.querySelector(".recycle-symbol");
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
      : "About the Digital Skills<br>Programme";
    const text = this.escapeHtml(this.attr(
      "text",
      "Practical, reusable training for researchers who need reliable digital methods."
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

        .recycle-visual {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0.46;
          pointer-events: none;
          perspective: 1100px;
        }

        .recycle-symbol {
          position: absolute;
          right: max(20vw, 86px);
          top: 50%;
          width: min(36vw, 420px);
          height: min(30vh, 300px);
          transform:
            translateY(-50%)
            rotateX(var(--symbol-x, 10deg))
            rotateY(var(--symbol-y, -16deg))
            rotateZ(var(--symbol-z, -4deg))
            translate3d(var(--symbol-dx, 0px), var(--symbol-dy, 0px), 0);
          transform-style: preserve-3d;
          transition: transform 0.18s linear;
          will-change: transform;
        }

        .recycle-field {
          position: absolute;
          inset: 5% 6% 3% 5%;
          border-radius: 36px;
          background:
            radial-gradient(circle at 28% 22%, rgba(0, 155, 193, 0.28), transparent 30%),
            radial-gradient(circle at 72% 72%, rgba(41, 133, 130, 0.28), transparent 34%),
            linear-gradient(135deg, rgba(0, 103, 129, 0.08), transparent 62%);
          transform: translateZ(4px) scale(var(--field-scale, 1));
        }

        .recycle-arrow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: clamp(230px, 27vw, 360px);
          aspect-ratio: 1;
          border-radius: 50%;
          background:
            conic-gradient(
              from var(--segment-start),
              transparent 0deg,
              transparent 10deg,
              var(--arrow-a) 10deg,
              var(--arrow-b) 102deg,
              transparent 118deg,
              transparent 360deg
            );
          -webkit-mask:
            radial-gradient(
              farthest-side,
              transparent calc(100% - clamp(26px, 3vw, 40px)),
              #000 calc(100% - clamp(25px, 3vw, 39px))
            );
          mask:
            radial-gradient(
              farthest-side,
              transparent calc(100% - clamp(26px, 3vw, 40px)),
              #000 calc(100% - clamp(25px, 3vw, 39px))
            );
          filter:
            drop-shadow(0 22px 38px rgba(16, 38, 59, 0.14))
            drop-shadow(0 0 18px color-mix(in srgb, var(--arrow-a) 38%, transparent));
          transform:
            translate(-50%, -50%)
            rotate(var(--ring-tilt, 0deg))
            translate3d(var(--arrow-shift-x, 0px), var(--arrow-shift-y, 0px), var(--arrow-depth));
          transition: transform 0.18s linear;
          will-change: transform;
        }

        .arrow-person {
          --segment-start: 218deg;
          --ring-tilt: -2deg;
          --arrow-a: #009bc1;
          --arrow-b: #006781;
          --arrow-depth: 78px;
        }

        .arrow-group {
          --segment-start: -22deg;
          --ring-tilt: 2deg;
          --arrow-a: #298582;
          --arrow-b: #009bc1;
          --arrow-depth: 104px;
        }

        .arrow-materials {
          --segment-start: 98deg;
          --ring-tilt: 0deg;
          --arrow-a: #006781;
          --arrow-b: #10263b;
          --arrow-depth: 58px;
        }

        .recycle-core {
          position: absolute;
          left: 50%;
          top: 50%;
          width: clamp(132px, 15vw, 204px);
          aspect-ratio: 1;
          border-radius: 34px;
          background:
            radial-gradient(circle at 34% 26%, rgba(255, 255, 255, 0.9), transparent 22%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.52)),
            linear-gradient(135deg, rgba(0, 155, 193, 0.24), rgba(41, 133, 130, 0.12));
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow:
            0 26px 48px rgba(16, 38, 59, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.76);
          transform:
            translate(-50%, -50%)
            translate3d(var(--core-x, 0px), var(--core-y, 0px), 132px)
            rotate(var(--core-rotate, 0deg));
          transition: transform 0.18s linear;
          will-change: transform;
        }

        .icon {
          position: absolute;
          display: block;
          filter: drop-shadow(0 16px 28px rgba(16, 38, 59, 0.12));
          transform:
            translate(-50%, -50%)
            translate3d(var(--icon-x, 0px), var(--icon-y, 0px), var(--icon-depth))
            rotate(var(--icon-rotate, 0deg));
          transition: transform 0.18s linear;
          will-change: transform;
        }

        .person-icon {
          left: 50%;
          top: 22%;
          width: clamp(64px, 7vw, 98px);
          aspect-ratio: 1;
          border-radius: 999px 999px 28px 28px;
          background:
            radial-gradient(circle at 50% 27%, #10263b 0 18%, transparent 19%),
            radial-gradient(ellipse at 50% 80%, #10263b 0 36%, transparent 37%),
            linear-gradient(135deg, #009bc1, #298582);
          --icon-depth: 168px;
        }

        .group-icon {
          left: 77%;
          top: 66%;
          width: clamp(98px, 11vw, 148px);
          height: clamp(64px, 7vw, 96px);
          border-radius: 26px;
          background:
            radial-gradient(circle at 27% 30%, #10263b 0 12%, transparent 13%),
            radial-gradient(circle at 50% 22%, #10263b 0 14%, transparent 15%),
            radial-gradient(circle at 73% 30%, #10263b 0 12%, transparent 13%),
            radial-gradient(ellipse at 27% 82%, #10263b 0 22%, transparent 23%),
            radial-gradient(ellipse at 50% 78%, #10263b 0 26%, transparent 27%),
            radial-gradient(ellipse at 73% 82%, #10263b 0 22%, transparent 23%),
            linear-gradient(135deg, #298582, #009bc1);
          --icon-depth: 154px;
        }

        .sheet-icon {
          left: 24%;
          top: 66%;
          width: clamp(86px, 10vw, 132px);
          height: clamp(104px, 12vw, 160px);
          border-radius: 16px 28px 16px 16px;
          background:
            linear-gradient(135deg, transparent 0 18%, rgba(16, 38, 59, 0.2) 18% 28%, transparent 28%) top right / 42% 42% no-repeat,
            linear-gradient(rgba(16, 38, 59, 0.2) 0 0) 18% 36% / 62% 0.48rem no-repeat,
            linear-gradient(rgba(16, 38, 59, 0.14) 0 0) 18% 52% / 72% 0.48rem no-repeat,
            linear-gradient(rgba(16, 38, 59, 0.1) 0 0) 18% 68% / 48% 0.48rem no-repeat,
            linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.58)),
            linear-gradient(135deg, #009bc1, #006781);
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow:
            0 22px 42px rgba(16, 38, 59, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
          --icon-depth: 146px;
        }

        .reuse-dot {
          position: absolute;
          width: clamp(9px, 1.2vw, 15px);
          aspect-ratio: 1;
          border-radius: 999px;
          background: var(--dot-color);
          box-shadow: 0 0 20px color-mix(in srgb, var(--dot-color) 62%, transparent);
          transform: translate(var(--dot-x, 0px), var(--dot-y, 0px));
        }

        .dot-one { left: 38%; top: 18%; --dot-color: #009bc1; }
        .dot-two { left: 84%; top: 48%; --dot-color: #298582; }
        .dot-three { left: 18%; top: 48%; --dot-color: #006781; }

        @media (max-width: 900px) {
          .hero {
            min-height: auto;
            padding: 3.2rem 1.5rem;
          }

          .recycle-visual {
            opacity: 0.3;
          }

          .recycle-symbol {
            right: -55vw;
            width: min(112vw, 660px);
            height: 360px;
            transform:
              translateY(-66%)
              scale(0.72)
              rotateX(var(--symbol-x, 10deg))
              rotateY(var(--symbol-y, -16deg))
              rotateZ(var(--symbol-z, -4deg));
          }
        }
      </style>

      <section class="hero">
        <div class="copy">
          <slot name="heading"><h1>${heading}</h1></slot>
          <slot name="text"><p class="text">${text}</p></slot>
        </div>
        <div class="recycle-visual" aria-hidden="true">
          <div class="recycle-symbol">
            <div class="recycle-field"></div>
            <span class="recycle-arrow arrow-person"></span>
            <span class="recycle-arrow arrow-group"></span>
            <span class="recycle-arrow arrow-materials"></span>
            <span class="recycle-core"></span>
            <span class="icon person-icon"></span>
            <span class="icon group-icon"></span>
            <span class="icon sheet-icon"></span>
            <span class="reuse-dot dot-one"></span>
            <span class="reuse-dot dot-two"></span>
            <span class="reuse-dot dot-three"></span>
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
    if (!this.visual || !this.symbol) return;

    const rect = this.visual.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const visualCenter = rect.top + rect.height / 2;
    const movement = (viewportCenter - visualCenter) / (window.innerHeight * 0.68);
    const clamped = Math.max(-1, Math.min(1, movement));

    this.symbol.style.setProperty("--symbol-x", `${(10 + clamped * 15).toFixed(2)}deg`);
    this.symbol.style.setProperty("--symbol-y", `${(-16 + clamped * 30).toFixed(2)}deg`);
    this.symbol.style.setProperty("--symbol-z", `${(-4 + clamped * -12).toFixed(2)}deg`);
    this.symbol.style.setProperty("--symbol-dx", `${(clamped * 28).toFixed(2)}px`);
    this.symbol.style.setProperty("--symbol-dy", `${(clamped * -18).toFixed(2)}px`);
    this.symbol.style.setProperty("--field-scale", `${(1 + Math.abs(clamped) * 0.1).toFixed(3)}`);
    this.symbol.style.setProperty("--arrow-shift-x", `${(clamped * -16).toFixed(2)}px`);
    this.symbol.style.setProperty("--arrow-shift-y", `${(clamped * 12).toFixed(2)}px`);
    this.symbol.style.setProperty("--core-x", `${(clamped * 8).toFixed(2)}px`);
    this.symbol.style.setProperty("--core-y", `${(clamped * -8).toFixed(2)}px`);
    this.symbol.style.setProperty("--core-rotate", `${(clamped * 18).toFixed(2)}deg`);
    this.symbol.style.setProperty("--icon-x", `${(clamped * 18).toFixed(2)}px`);
    this.symbol.style.setProperty("--icon-y", `${(clamped * -14).toFixed(2)}px`);
    this.symbol.style.setProperty("--icon-rotate", `${(clamped * -8).toFixed(2)}deg`);
    this.symbol.style.setProperty("--dot-x", `${(clamped * 22).toFixed(2)}px`);
    this.symbol.style.setProperty("--dot-y", `${(clamped * -16).toFixed(2)}px`);
  }
}

if (!customElements.get("about-header-hero")) {
  customElements.define("about-header-hero", AboutHeaderHero);
}

function mountAboutHeaderHero() {
  if (document.querySelector("about-header-hero")) return;

  const main = document.querySelector("main#quarto-document-content") || document.body;
  const hero = document.createElement("about-header-hero");
  main.insertBefore(hero, main.firstChild);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountAboutHeaderHero);
} else {
  mountAboutHeaderHero();
}
