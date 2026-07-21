(() => {
  const initCodingClinicReveals = () => {
    const revealItems = document.querySelectorAll(
      ".coding-clinic-summary, .coding-clinic-model, .coding-clinic-why, .coding-clinic-principles, .coding-clinic-form, .landing-split"
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
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.16 });

    revealItems.forEach((item) => observer.observe(item));
    window.requestAnimationFrame(() => {
      const first = document.querySelector(".coding-clinic-summary");
      if (first) first.classList.add("is-visible");
    });
  };

  const initDeferredClinicForm = () => {
    const iframe = document.querySelector(".coding-clinic-form iframe[data-deferred-src]");
    if (!iframe) return;

    const loadForm = () => {
      if (iframe.src) return;
      iframe.src = iframe.dataset.deferredSrc;
    };

    if (!("IntersectionObserver" in window)) {
      window.addEventListener("scroll", loadForm, { once: true, passive: true });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      loadForm();
      observer.disconnect();
    }, { rootMargin: "480px 0px", threshold: 0.01 });

    observer.observe(iframe);
  };

  const init = () => {
    initCodingClinicReveals();
    initDeferredClinicForm();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
