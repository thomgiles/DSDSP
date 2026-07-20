<script>
/* ==========================================================================
   rjs-slide-fit.js

   Header-aware dynamic slide fitting for Quarto RevealJS.

   Behaviour:
   - manages all slides by default
   - respects --gh and --gf
   - respects --rjs-fit-top-buffer and --rjs-fit-bottom-buffer
   - scales dense slides down using font-size, not transform
   - spreads sparse slides out using dynamic margins
   - avoids the global header and footer
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Configuration
     ------------------------------------------------------------------------ */

  const AUTO_FIT_ALL_SLIDES = true;

  const CONFIG = {
    minScale: 0.68,
    maxSparseScale: 1.06,

    viewportWidthRatio: 0.90,

    minGapPx: 6,
    baseGapEm: 0.38,
    maxGapPx: 48,

    maxTopSpacePx: 76,

    overflowTolerancePx: 10,

    delayedFitPassesMs: [60, 160, 360, 800, 1400]
  };

  const MANAGED_CLASSES = [
    "rjs-fit-managed",
    "rjs-fit-tight",
    "rjs-fit-media-tight",
    "rjs-fit-callout-tight",
    "rjs-fit-table-slide",
    "rjs-fit-code-slide",
    "rjs-fit-visual-slide",
    "rjs-fit-title-visual",
    "rjs-fit-quote-slide",
    "rjs-fit-roomy",
    "rjs-fit-overflow",
    "is-auto-fitted"
  ];

  const SHRINKABLE_CALLOUT_SELECTOR =
    ".callout-outcomes, .callout-questions, .callout-keypoints, .callout-hints";

  let resizeTimer = null;
  let isFitting = false;
  let resizeObserver = null;
  let observedSlide = null;
  let fitPassTimers = [];
  const decodedImages = new WeakSet();

  /* ------------------------------------------------------------------------
     Basic helpers
     ------------------------------------------------------------------------ */

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getCssNumber(name, fallback) {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();

    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function getActiveSlide() {
    if (window.Reveal?.getCurrentSlide) {
      return window.Reveal.getCurrentSlide();
    }

    let slide = (
      document.querySelector(".reveal .slides > section.stack.present > section.present") ||
      document.querySelector(".reveal .slides > section.present:not(.stack)")
    );

    while (slide) {
      const nested = Array.from(slide.children).find((child) => (
        child instanceof HTMLElement &&
        child.tagName === "SECTION" &&
        child.classList.contains("present")
      ));

      if (!nested) {
        break;
      }

      slide = nested;
    }

    return slide;
  }

  function hasShrinkableCallout(slide) {
    return (
      slide.matches(SHRINKABLE_CALLOUT_SELECTOR) ||
      slide.querySelector(SHRINKABLE_CALLOUT_SELECTOR) !== null
    );
  }

  function shouldManageSlide(slide) {
    if (!slide) return false;

    if (
      slide.classList.contains("no-fit") ||
      slide.dataset.fit === "off" ||
      slide.dataset.fit === "false"
    ) {
      return false;
    }

    return (
      AUTO_FIT_ALL_SLIDES ||
      slide.classList.contains("fit-slide") ||
      slide.classList.contains("auto-fit") ||
      slide.dataset.fit === "true" ||
      slide.dataset.fit === "auto"
    );
  }

  function isElementMeasurable(el) {
    if (!el || !(el instanceof HTMLElement)) return false;

    if (
      el.matches("script, style, noscript, template") ||
      el.matches("aside.notes, .notes") ||
      el.matches(".footer, .slide-number")
    ) {
      return false;
    }

    const style = window.getComputedStyle(el);

    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.position === "fixed"
    ) {
      return false;
    }

    const rect = el.getBoundingClientRect();

    return rect.width > 0 && rect.height > 0;
  }

  function getMeasuredChildren(slide) {
    return Array.from(slide.children).filter(isElementMeasurable);
  }

  function measureElements(elements) {
    if (!elements.length) {
      return {
        width: 0,
        height: 0,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      };
    }

    let top = Infinity;
    let left = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    let contentHeight = 0;

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();

      top = Math.min(top, rect.top);
      left = Math.min(left, rect.left);
      right = Math.max(right, rect.right);
      bottom = Math.max(bottom, rect.bottom);
      contentHeight += rect.height;
    });

    return {
      width: right - left,
      height: bottom - top,
      contentHeight,
      top,
      bottom,
      left,
      right
    };
  }

  function getAvailableBox() {
    const gh = getCssNumber("--gh", 80);
    const gf = getCssNumber("--gf", 40);

    const topBuffer = getCssNumber("--rjs-fit-top-buffer", 72);
    const bottomBuffer = getCssNumber("--rjs-fit-bottom-buffer", 36);

    return {
      width: window.innerWidth * CONFIG.viewportWidthRatio,
      height: Math.max(
        100,
        window.innerHeight - gh - gf - topBuffer - bottomBuffer
      )
    };
  }

  function getBaseGapPx(slide) {
    const fontSize = parseFloat(window.getComputedStyle(slide).fontSize);
    const base = Number.isFinite(fontSize)
      ? fontSize * CONFIG.baseGapEm
      : 12;

    return clamp(base, CONFIG.minGapPx, CONFIG.maxGapPx);
  }

  function clearManagedState(slide) {
    if (!slide) return;

    MANAGED_CLASSES.forEach((className) => {
      slide.classList.remove(className);
    });

    slide.style.removeProperty("--rjs-fit-scale");
    slide.style.removeProperty("--rjs-fit-gap");
    slide.style.removeProperty("--rjs-fit-top-space");
    slide.style.removeProperty("--rjs-fit-media-trim");
    slide.style.removeProperty("--rjs-fit-callout-trim");
    slide.style.removeProperty("--rjs-fit-safe-height");
  }

  function clearFitPassTimers() {
    fitPassTimers.forEach((timer) => window.clearTimeout(timer));
    fitPassTimers = [];
  }

  function applyManagedState(slide, layout) {
    slide.style.setProperty("--rjs-fit-scale", layout.scale.toFixed(4));
    slide.style.setProperty("--rjs-fit-gap", `${Math.round(layout.gapPx)}px`);
    slide.style.setProperty("--rjs-fit-top-space", `${Math.round(layout.topSpacePx)}px`);
    slide.style.setProperty("--rjs-fit-media-trim", `${Math.round(layout.mediaTrimPx)}px`);
    slide.style.setProperty("--rjs-fit-callout-trim", `${Math.round(layout.calloutTrimPx)}px`);
    slide.style.setProperty("--rjs-fit-safe-height", `${Math.round(layout.safeHeightPx)}px`);

    slide.classList.add("rjs-fit-managed");
    slide.classList.add("is-auto-fitted");

    if (layout.hasTable) {
      slide.classList.add("rjs-fit-table-slide");
    }

    if (layout.hasCode) {
      slide.classList.add("rjs-fit-code-slide");
    }

    if (layout.hasVisual) {
      slide.classList.add("rjs-fit-visual-slide");
    }

    if (layout.isTitleVisual) {
      slide.classList.add("rjs-fit-title-visual");
    }

    if (layout.hasQuote) {
      slide.classList.add("rjs-fit-quote-slide");
    }

    if (layout.scale < 0.96) {
      slide.classList.add("rjs-fit-tight");
    }

    if (layout.mediaTrimPx > 0) {
      slide.classList.add("rjs-fit-media-tight");
    }

    if (layout.calloutTrimPx > 0) {
      slide.classList.add("rjs-fit-callout-tight");
    }

    if (layout.isRoomy) {
      slide.classList.add("rjs-fit-roomy");
    }

    if (layout.isOverflow) {
      slide.classList.add("rjs-fit-overflow");
    }
  }

  /* ------------------------------------------------------------------------
     Layout calculation
     ------------------------------------------------------------------------ */

  function calculateLayout(slide, measurement, childCount) {
    const available = getAvailableBox();

    const rawHeight = Math.max(1, measurement.contentHeight || measurement.height);
    const rawWidth = Math.max(1, measurement.width);

    const scaleY = available.height / rawHeight;
    const scaleX = available.width / rawWidth;

    let scale = Math.min(scaleX, scaleY, 1);
    scale = clamp(scale, CONFIG.minScale, 1);

    const hasTable = slide.querySelector("table") !== null;
    const hasCode = slide.querySelector("pre, code.sourceCode") !== null;
    const hasVisual =
      slide.querySelector("figure, img, video, iframe, .mermaid-js") !== null;
    const hasQuote = slide.querySelector("blockquote") !== null;
    const isTitleVisual =
      hasVisual && slide.matches(".title-slide, .level1, .quarto-title-block");

    const hasLargeMedia =
      slide.querySelector("figure, img, video, iframe, table, pre, .mermaid-js") !== null;
    const hasShrinkableMedia =
      slide.querySelector("figure, img, video, iframe, .mermaid-js") !== null;
    const hasCallout = hasShrinkableCallout(slide);

    const isSparse =
      rawHeight < available.height * 0.52 &&
      rawWidth < available.width * 0.86 &&
      !hasLargeMedia;

    if (isSparse && !slide.classList.contains("no-upscale")) {
      const sparseScale = Math.sqrt(Math.min(scaleX, scaleY));
      scale = clamp(sparseScale * 0.92, 1, CONFIG.maxSparseScale);
    }

    if (slide.classList.contains("no-scale")) {
      scale = 1;
    }

    const scaledHeight = rawHeight * scale;
    const remainingHeight = Math.max(0, available.height - scaledHeight);

    const baseGap = getBaseGapPx(slide);
    const gapSlots = Math.max(0, childCount - 1);

    let gapPx = baseGap;
    let topSpacePx = 0;

    if (!slide.classList.contains("no-spread")) {
      if (remainingHeight > available.height * 0.18) {
        const roomyFactor = isSparse ? 0.58 : 0.36;

        if (gapSlots > 0) {
          gapPx = clamp(
            remainingHeight * roomyFactor / gapSlots,
            baseGap,
            CONFIG.maxGapPx
          );
        }

        topSpacePx = clamp(
          remainingHeight * (isSparse ? 0.22 : 0.12),
          0,
          CONFIG.maxTopSpacePx
        );
      } else if (scale < 0.96) {
        gapPx = CONFIG.minGapPx;
      }
    }

    if (scale < 0.96) {
      gapPx = CONFIG.minGapPx;
      topSpacePx = 0;
    }

    const projectedHeight =
      scaledHeight +
      topSpacePx +
      Math.max(0, gapSlots * gapPx);

    const nearOverflow = projectedHeight > available.height * 0.92;
    const mediaTrimPx = hasShrinkableMedia && nearOverflow
      ? clamp(projectedHeight - available.height + (isTitleVisual ? 56 : 32), 24, isTitleVisual ? 110 : 70)
      : 0;
    const calloutTrimPx = hasCallout && nearOverflow
      ? clamp(projectedHeight - available.height + 28, 18, 76)
      : 0;

    const isOverflow =
      projectedHeight > available.height + CONFIG.overflowTolerancePx &&
      scale <= CONFIG.minScale + 0.01;

    return {
      scale,
      gapPx,
      topSpacePx,
      mediaTrimPx,
      calloutTrimPx,
      hasTable,
      hasCode,
      hasVisual,
      isTitleVisual,
      hasQuote,
      safeHeightPx: Math.max(100, available.height - 108),
      isRoomy: scale >= 0.96 && (isSparse || remainingHeight > available.height * 0.25),
      isOverflow
    };
  }

  function refineLayoutIfNeeded(slide, layout) {
    const available = getAvailableBox();

    applyManagedState(slide, layout);

    forceLayout(slide);

    const children = getMeasuredChildren(slide);
    const measured = measureElements(children);

    if (measured.height > available.height + CONFIG.overflowTolerancePx) {
      const hasLargeMedia =
        slide.querySelector("figure, img, video, iframe, .mermaid-js") !== null;

      if (hasLargeMedia) {
        layout.mediaTrimPx = clamp(
          layout.mediaTrimPx + (measured.height - available.height) + 24,
          24,
          90
        );
        applyManagedState(slide, layout);
        forceLayout(slide);

        const mediaAdjusted = measureElements(getMeasuredChildren(slide));

        if (mediaAdjusted.height <= available.height + CONFIG.overflowTolerancePx) {
          return layout;
        }
      }

      const hasCallout = hasShrinkableCallout(slide);

      if (hasCallout) {
        layout.calloutTrimPx = clamp(
          layout.calloutTrimPx + (measured.height - available.height) + 20,
          18,
          96
        );
        applyManagedState(slide, layout);
        forceLayout(slide);

        const calloutAdjusted = measureElements(getMeasuredChildren(slide));

        if (calloutAdjusted.height <= available.height + CONFIG.overflowTolerancePx) {
          return layout;
        }
      }

      const correction = available.height / measured.height;
      layout.scale = clamp(
        layout.scale * correction,
        CONFIG.minScale,
        layout.scale
      );

      if (layout.scale <= CONFIG.minScale + 0.01) {
        layout.gapPx = CONFIG.minGapPx;
        layout.topSpacePx = 0;
        layout.isOverflow = true;
        layout.mediaTrimPx = layout.hasVisual
          ? clamp(layout.mediaTrimPx + 24, 24, layout.isTitleVisual ? 130 : 110)
          : layout.mediaTrimPx;
      }

      applyManagedState(slide, layout);
    }

    return layout;
  }

  function forceLayout(el) {
    /* Forces style calculation before measuring. */
    void el.offsetHeight;
  }

  /* ------------------------------------------------------------------------
     Fitting lifecycle
     ------------------------------------------------------------------------ */

  function fitSlide(slide) {
    if (!slide || isFitting) return;

    isFitting = true;

    try {
      clearManagedState(slide);

      if (!shouldManageSlide(slide)) {
        return;
      }

      const children = getMeasuredChildren(slide);
      const measurement = measureElements(children);

      if (!children.length || measurement.height <= 0) {
        clearManagedState(slide);
        return;
      }

      const layout = calculateLayout(slide, measurement, children.length);
      refineLayoutIfNeeded(slide, layout);
      observeSlide(slide);
    } finally {
      isFitting = false;
    }
  }

  function fitCurrentSlide() {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const slide = getActiveSlide();
        fitSlide(slide);
      });
    });
  }

  function scheduleFit(delayMs) {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      fitCurrentSlide();
    }, delayMs);
  }

  function scheduleFitPasses() {
    clearFitPassTimers();
    fitCurrentSlide();

    CONFIG.delayedFitPassesMs.forEach((delay) => {
      fitPassTimers.push(window.setTimeout(fitCurrentSlide, delay));
    });
  }

  function observeSlide(slide) {
    if (typeof ResizeObserver === "undefined") return;

    if (observedSlide === slide) return;

    if (resizeObserver) {
      resizeObserver.disconnect();
    }

    observedSlide = slide;

    resizeObserver = new ResizeObserver(() => {
      if (!isFitting) {
        scheduleFit(80);
      }
    });

    resizeObserver.observe(slide);

    getMeasuredChildren(slide).forEach((child) => {
      resizeObserver.observe(child);
    });
  }

  function fitAfterImagesLoad() {
    const slide = getActiveSlide();
    if (!slide) return;

    const images = slide.querySelectorAll("img");
    let requestedDecodeFit = false;

    const requestImageFit = () => {
      if (getActiveSlide() !== slide) return;
      scheduleFitPasses();
    };

    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", requestImageFit, { once: true });
        img.addEventListener("error", requestImageFit, { once: true });
        return;
      }

      if (
        !decodedImages.has(img) &&
        typeof img.decode === "function" &&
        img.naturalWidth > 0
      ) {
        decodedImages.add(img);
        requestedDecodeFit = true;

        img.decode()
          .then(requestImageFit)
          .catch(requestImageFit);
      }
    });

    if (!requestedDecodeFit && images.length > 0) {
      window.setTimeout(requestImageFit, 120);
    }
  }

  function initRevealFit() {
    if (!window.Reveal || typeof window.Reveal.on !== "function") {
      window.setTimeout(initRevealFit, 50);
      return;
    }

    window.Reveal.on("ready", () => {
      scheduleFitPasses();
      fitAfterImagesLoad();
    });

    window.Reveal.on("slidechanged", () => {
      scheduleFitPasses();
      fitAfterImagesLoad();
    });

    window.Reveal.on("fragmentshown", () => {
      scheduleFit(60);
    });

    window.Reveal.on("fragmenthidden", () => {
      scheduleFit(60);
    });

    window.addEventListener("resize", () => {
      scheduleFit(120);
    });

    window.addEventListener("load", () => {
      scheduleFitPasses();
    });

    if (document.fonts?.ready) {
      document.fonts.ready
        .then(scheduleFitPasses)
        .catch(() => {});
    }

    /* The include-after-body script can load after Reveal has already fired
       its ready event, so run one pass immediately after binding listeners. */
    window.setTimeout(() => {
      scheduleFitPasses();
      fitAfterImagesLoad();
    }, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRevealFit);
  } else {
    initRevealFit();
  }
})();
</script>
