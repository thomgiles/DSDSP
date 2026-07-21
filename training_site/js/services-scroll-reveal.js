(() => {
  const initServicesReveals = () => {
    const revealItems = document.querySelectorAll(
      ".services-summary, .services-offer, .services-collaboration, .services-next-steps, .landing-split"
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
      const first = document.querySelector(".services-summary");
      if (first) first.classList.add("is-visible");
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initServicesReveals);
  } else {
    initServicesReveals();
  }
})();
