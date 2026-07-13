(() => {
  const initAboutScrollReveals = () => {
    const lede = document.querySelector(".about-lede");
    const revealItems = document.querySelectorAll(
      ".about-open-access, .about-gradient-band, .about-two-col, .landing-split, .about-contact"
    );
    if (!lede && !revealItems.length) return;

    const updateLedePastState = () => {
      if (!lede) return;
      const rect = lede.getBoundingClientRect();
      const isPast = rect.bottom < window.innerHeight * 0.28;
      lede.classList.toggle("is-past", isPast);
      if (isPast) {
        lede.classList.remove("is-visible");
      } else {
        lede.classList.add("is-visible");
      }
    };

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      updateLedePastState();
      window.addEventListener("scroll", updateLedePastState, { passive: true });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.18 });

    revealItems.forEach((item) => observer.observe(item));

    window.requestAnimationFrame(() => {
      if (lede) {
        lede.classList.add("is-visible");
      }
      updateLedePastState();
    });

    window.addEventListener("scroll", updateLedePastState, { passive: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAboutScrollReveals);
  } else {
    initAboutScrollReveals();
  }
})();
