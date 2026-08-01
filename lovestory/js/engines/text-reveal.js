export function splitIntoWords(el) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.innerHTML = '';
  const words = text.split(/(\s+)/);

  words.forEach((word) => {
    if (word.trim() === '') {
      el.appendChild(document.createTextNode(word));
      return;
    }
    const span = document.createElement('span');
    span.className = 'word-reveal';
    span.textContent = word;
    span.setAttribute('aria-hidden', 'true');
    el.appendChild(span);
  });

  return el.querySelectorAll('.word-reveal');
}

export function initTextReveal(scopeEl) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) return;

  const paragraphs = scopeEl.querySelectorAll('.story-text');
  paragraphs.forEach((p) => {
    const words = splitIntoWords(p);
    // Smooth, gentle reveal when paragraph enters view, ensuring 100% opacity and clear text
    window.gsap.fromTo(
      words,
      { opacity: 0.2 },
      {
        opacity: 1,
        duration: 0.4,
        stagger: 0.012,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: p,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
      }
    );
  });
}
