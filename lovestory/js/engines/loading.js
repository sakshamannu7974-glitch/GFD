const SENTENCES = [
  'Every love story begins with a single moment...',
  'Kuch yaadein kabhi nahi bhoolti...',
  'Hamara safar shuru hota hai...',
];

export function runLoadingSequence({ onDone } = {}) {
  const screen = document.createElement('div');
  screen.id = 'loading-screen';
  screen.setAttribute('role', 'status');
  screen.setAttribute('aria-live', 'polite');

  const heartbeat = document.createElement('div');
  heartbeat.className = 'loading-heartbeat';
  screen.appendChild(heartbeat);

  const textEl = document.createElement('p');
  textEl.className = 'loading-text';
  screen.appendChild(textEl);

  document.body.appendChild(screen);
  document.body.style.overflow = 'hidden';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function finish() {
    screen.classList.add('is-hidden');
    document.body.style.overflow = '';
    setTimeout(() => {
      screen.remove();
      if (onDone) onDone();
    }, 1200);
  }

  if (prefersReducedMotion) {
    // Skip straight to the site -- no one should be forced to wait
    // through a 8s animated sequence if they've asked for reduced motion.
    finish();
    return;
  }

  let i = 0;
  function showNext() {
    if (i >= SENTENCES.length) {
      finish();
      return;
    }
    textEl.textContent = SENTENCES[i];
    textEl.classList.remove('is-active');
    // Force reflow so the animation restarts each time.
    void textEl.offsetWidth;
    textEl.classList.add('is-active');
    i += 1;
    setTimeout(showNext, 2600);
  }

  setTimeout(showNext, 500);

  // Safety net: never trap a visitor on the loading screen if something
  // above goes wrong (slow connection, a paused tab, etc).
  setTimeout(finish, 12000);
}
