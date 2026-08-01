/**
 * Wraps Lenis (loaded from CDN as window.Lenis) for premium inertial
 * scrolling, and keeps GSAP's ScrollTrigger in sync with it -- without
 * this sync step, ScrollTrigger measures the native scroll position
 * while Lenis is rendering an interpolated one, and pinned/scrubbed
 * animations drift out of alignment.
 */
export function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null; // native scroll is the right call for reduced-motion users
  }
  if (!window.Lenis) {
    console.warn('Lenis not loaded -- falling back to native scroll.');
    return null;
  }

  const lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', () => {
    if (window.ScrollTrigger) window.ScrollTrigger.update();
  });

  if (window.gsap && window.ScrollTrigger) {
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  return lenis;
}
