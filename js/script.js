document.addEventListener("DOMContentLoaded", () => {

  // 1. Sticky navbar
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  });

  // 2. Scroll reveal helper: adds `cls` once when elements enter the viewport
  const reveal = (selector, cls, threshold, delay = 0) => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add(cls), delay);
        obs.unobserve(entry.target);
      });
    }, { threshold });
    document.querySelectorAll(selector).forEach(el => observer.observe(el));
  };

  reveal(".fade-in-element", "visible", 0.15, 150);
  reveal(".zp-reveal-fade, .zp-reveal-up", "zp-is-visible", 0.2);
  reveal(".mono-slide-from-left, .mono-slide-from-right", "mono-is-in-view", 0.15);
  reveal(".zp-perf-trigger-scale, .zp-perf-trigger-fade-up", "zp-perf-activated", 0.25);
  reveal(".zp-why-animate-up, .zp-why-animate-right, .zp-why-animate-zoom", "zp-why-visible", 0.15);
  reveal(".zpf-animate-fade, .zpf-animate-slide-up", "zpf-show-anim", 0.2);

  // 3. Stats count-up (runs once when visible)
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || "";
      const duration = 2000;
      const startTime = performance.now();

      const tick = now => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      };

      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll(".zp-stat-number").forEach(el => counterObserver.observe(el));
});