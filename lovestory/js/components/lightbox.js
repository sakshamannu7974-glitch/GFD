/**
 * Minimal, dependency-free lightbox. Exposed as window.__openLightbox so
 * the chapter-renderer (which has no animation/state concerns) can call
 * it without an import cycle.
 */
export function initLightbox() {
  const existing = document.getElementById('lightbox');
  if (existing) return; // already initialized -- never create a second one

  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <div class="lightbox-stage"></div>
  `;
  document.body.appendChild(overlay);

  const stage = overlay.querySelector('.lightbox-stage');
  const closeBtn = overlay.querySelector('.lightbox-close');

  function close() {
    overlay.classList.remove('is-open');
    stage.querySelectorAll('video').forEach((v) => v.pause());
    setTimeout(() => { stage.innerHTML = ''; }, 300);
  }

  window.__openLightbox = (item) => {
    stage.innerHTML = '';
    let node;
    if (item.type === 'video') {
      node = document.createElement('video');
      node.src = item.src;
      node.controls = true;
      node.autoplay = true;
      node.playsInline = true;
    } else {
      node = document.createElement('img');
      node.src = item.src;
      node.alt = item.title || item.chapterTitle || '';
    }
    stage.appendChild(node);

    const titleText = item.title || item.chapterTitle;
    if (titleText) {
      const caption = document.createElement('div');
      caption.className = 'lightbox-caption';
      caption.textContent = titleText;
      stage.appendChild(caption);
    }

    overlay.classList.add('is-open');
  };

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}
