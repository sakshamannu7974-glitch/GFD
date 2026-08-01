/**
 * "The cursor should become part of the experience... Hovering photos
 * should react... buttons attract the cursor... small particles follow."
 * (brief, Part 6)
 *
 * A lightweight custom cursor: a small dot that trails the pointer with
 * slight lag, growing and picking up the active chapter's accent color
 * when hovering anything interactive (memory cards, buttons, links).
 * Disabled entirely on touch devices (no pointer to follow) and under
 * prefers-reduced-motion (a trailing, growing cursor is exactly the kind
 * of motion that spec asks to remove).
 */
export function initCursor() {
  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouchDevice || prefersReducedMotion) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);
  document.body.classList.add('has-custom-cursor');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const INTERACTIVE_SELECTOR =
    '.memory-card, .sound-toggle, .letter-envelope, .video-feature, a, button';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(INTERACTIVE_SELECTOR)) dot.classList.add('is-hovering');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(INTERACTIVE_SELECTOR)) dot.classList.remove('is-hovering');
  });
  document.addEventListener('mousedown', () => dot.classList.add('is-pressed'));
  document.addEventListener('mouseup', () => dot.classList.remove('is-pressed'));

  function tick() {
    // Slight lag ("attraction") rather than 1:1 tracking -- reads as
    // alive rather than as a second, redundant pointer.
    dotX += (mouseX - dotX) * 0.18;
    dotY += (mouseY - dotY) * 0.18;
    dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
