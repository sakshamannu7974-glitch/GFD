/**
 * Everything that happens *because* the visitor scrolled:
 *  - fades/rises chapter content into view (GSAP if present, CSS fallback)
 *  - tells the particle system which emotion palette is active
 *  - plays/pauses in-view videos (never autoplaying off-screen media)
 *  - fills the timeline progress bar
 *
 * Falls back to a plain IntersectionObserver (no stagger, opacity-only)
 * if GSAP isn't available, so the site still works if the CDN fails.
 */
export function initChapterObserver({ setEmotion } = {}) {
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) document.body.classList.add('reduced-motion');

  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
  if (hasGsap) window.gsap.registerPlugin(window.ScrollTrigger);

  // ---- Emotion cross-fade: which chapter is most centered in view ----
  const emotionSections = document.querySelectorAll('[data-emotion]');
  const emotionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const emotion = entry.target.dataset.emotion;
          root.dataset.emotion = emotion;
          if (setEmotion) setEmotion(emotion);
        }
      });
    },
    { threshold: [0.5] }
  );
  emotionSections.forEach((s) => emotionObserver.observe(s));

  // ---- Reveal animations ----
  if (!prefersReducedMotion) {
    if (hasGsap) {
      // Hero elements — immediate reveal on page load
      document.querySelectorAll('.hero-eyebrow, .hero-title, .hero-subtitle, .hero-collage-wrap, .scroll-cue')
        .forEach((elm, i) => {
          window.gsap.to(elm, { opacity: 1, y: 0, duration: 1.1, delay: 0.15 * i, ease: 'power3.out' });
        });

      // All sections — animate headers, media cards, and video features on scroll
      document.querySelectorAll('.chapter, .letter-section, .closing').forEach((section) => {
        const header = section.querySelector('.chapter-header');
        if (header) {
          window.gsap.from(header, {
            opacity: 0,
            y: 40,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: section, start: 'top 80%' },
          });
        }

        // Story text paragraphs — ensure they're always visible (text-reveal.js handles word animation)
        const storyTexts = section.querySelectorAll('.story-text');
        if (storyTexts.length) {
          window.gsap.fromTo(storyTexts,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: { trigger: section, start: 'top 75%' },
            }
          );
        }

        // Memory cards — explicit fromTo so initial state is always correct
        const cards = section.querySelectorAll('.memory-card');
        if (cards.length) {
          window.gsap.fromTo(cards,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.06,
              ease: 'power2.out',
              scrollTrigger: { trigger: section, start: 'top 90%' },
            }
          );
        }

        // Featured video — explicit fromTo
        const feature = section.querySelector('.video-feature');
        if (feature) {
          window.gsap.fromTo(feature,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 1,
              scrollTrigger: { trigger: feature, start: 'top 90%' },
            }
          );
        }
      });

      // Recalculate layout metrics after all images finish loading
      window.addEventListener('load', () => {
        if (window.ScrollTrigger) {
          // Small delay to ensure all lazy images have their final size
          setTimeout(() => window.ScrollTrigger.refresh(), 500);
        }
      });

      // Also refresh after a few seconds as a safety net for slow-loading images
      setTimeout(() => {
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      }, 3000);

      // Timeline progress fill, tied to total document scroll.
      window.ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          root.style.setProperty('--scroll-progress', `${self.progress * 100}%`);
        },
      });
    } else {
      // No-GSAP fallback: simple fade-in via IntersectionObserver.
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
              entry.target.style.opacity = 1;
              entry.target.style.transform = 'none';
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      document.querySelectorAll('.memory-card, .chapter-header, .video-feature, .hero-title, .hero-subtitle, .story-text')
        .forEach((elm) => revealObserver.observe(elm));
    }
  } else {
    document.body.classList.add('reduced-motion');
  }

  // ---- Video play-on-view, pause-off-view, lazy source assignment ----
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (!video.src && video.dataset.src) video.src = video.dataset.src;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll('video[data-src]').forEach((v) => videoObserver.observe(v));
}
