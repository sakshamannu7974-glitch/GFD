/**
 * Optimized Photo Gallery Module
 * - Instant modal opening with batch rendering (24 items/batch)
 * - Infinite scroll + Load More support
 * - Lightbox integration
 */

export function initPhotoGallery(storyData) {
  if (document.getElementById('photo-gallery-modal')) return;

  // Extract all media items with chapter tags
  const allItems = [];
  storyData.forEach((chapter) => {
    if (chapter.media && chapter.media.length) {
      let category = 'Special';
      const title = chapter.title || '';
      if (chapter.id === 'interlude') category = 'Calls';
      else if (chapter.id === 'ch02' || chapter.id === 'ch07') category = 'Gifts';
      else if (chapter.id === 'ch08' || chapter.id === 'ch09' || chapter.id === 'ch10' || chapter.id === 'ch11') category = 'Delhi';
      else if (chapter.id === 'ch14' || chapter.id === 'ch15') category = 'Temple';
      else if (chapter.id === 'hero' || chapter.id === 'closing' || chapter.id === 'contract') category = 'Special';

      chapter.media.forEach((item) => {
        let itemTitle = item.title || title || chapter.dateLabel || 'Memory';
        if (!item.title && category === 'Special' && chapter.id !== 'contract' && chapter.id !== 'hero' && chapter.id !== 'closing') {
          itemTitle = 'Suar 🐷';
        }

        allItems.push({
          ...item,
          chapterTitle: itemTitle,
          category,
        });
      });
    }
  });

  // 1. Create Side Floating Trigger Button
  const triggerBtn = document.createElement('button');
  triggerBtn.id = 'gallery-trigger-btn';
  triggerBtn.className = 'gallery-side-btn';
  triggerBtn.title = 'Photo Gallery';
  triggerBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
    <span>Photo Gallery</span>
  `;
  document.body.appendChild(triggerBtn);

  // 2. Create Gallery Modal Element
  const modal = document.createElement('div');
  modal.id = 'photo-gallery-modal';
  modal.className = 'gallery-modal';
  modal.innerHTML = `
    <div class="gallery-backdrop"></div>
    <div class="gallery-content">
      <div class="gallery-header">
        <div class="gallery-title-group">
          <h2 class="gallery-main-title">🖼️ Hamari Yaadein Gallery</h2>
          <p class="gallery-sub-title">Sari khoobsurat photos aur videos (<span id="gallery-count-badge">${allItems.length}</span>)</p>
        </div>
        <button class="gallery-close-btn" id="gallery-close-btn" aria-label="Close">&times;</button>
      </div>

      <div class="gallery-filters" id="gallery-filters">
        <button class="gallery-filter-btn is-active" data-cat="all">✨ All (${allItems.length})</button>
        <button class="gallery-filter-btn" data-cat="Delhi">📍 Delhi Trip</button>
        <button class="gallery-filter-btn" data-cat="Calls">📞 Video Calls</button>
        <button class="gallery-filter-btn" data-cat="Gifts">🎁 Gifts & Letters</button>
        <button class="gallery-filter-btn" data-cat="Temple">🛕 Mandir Visit</button>
        <button class="gallery-filter-btn" data-cat="Special">🐷 Suar (Special)</button>
      </div>

      <div class="gallery-grid" id="gallery-grid"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const gridEl = modal.querySelector('#gallery-grid');
  const countBadge = modal.querySelector('#gallery-count-badge');
  const filterBtns = modal.querySelectorAll('.gallery-filter-btn');
  const closeBtn = modal.querySelector('#gallery-close-btn');
  const backdrop = modal.querySelector('.gallery-backdrop');

  let activeCategory = 'all';
  let currentPage = 1;
  const BATCH_SIZE = 24;

  function getFilteredItems() {
    return activeCategory === 'all'
      ? allItems
      : allItems.filter(item => item.category === activeCategory);
  }

  function renderBatch(reset = false) {
    if (reset) {
      gridEl.innerHTML = '';
      currentPage = 1;
    }

    const filtered = getFilteredItems();
    countBadge.textContent = String(filtered.length);

    const startIndex = (currentPage - 1) * BATCH_SIZE;
    const endIndex = Math.min(startIndex + BATCH_SIZE, filtered.length);
    const itemsToRender = filtered.slice(startIndex, endIndex);

    const oldBtn = gridEl.querySelector('.gallery-load-more-wrap');
    if (oldBtn) oldBtn.remove();

    const fragment = document.createDocumentFragment();

    itemsToRender.forEach((item) => {
      const card = document.createElement('div');
      card.className = `gallery-card ${item.type === 'video' ? 'is-video' : ''}`;

      if (item.type === 'video') {
        const posterSrc = item.poster || '';
        card.innerHTML = `
          <div class="gallery-media-wrap">
            <img src="${posterSrc}" alt="${item.chapterTitle}" loading="lazy" onerror="this.src='assets/images/hero/collage-01.png'" />
            <div class="gallery-play-icon">▶</div>
          </div>
          <div class="gallery-card-label">${item.chapterTitle}</div>
        `;
      } else {
        card.innerHTML = `
          <div class="gallery-media-wrap">
            <img src="${item.src}" alt="${item.chapterTitle}" loading="lazy" />
          </div>
          <div class="gallery-card-label">${item.chapterTitle}</div>
        `;
      }

      card.addEventListener('click', () => {
        if (window.__openLightbox) {
          window.__openLightbox(item);
        }
      });

      fragment.appendChild(card);
    });

    gridEl.appendChild(fragment);

    if (endIndex < filtered.length) {
      const loadMoreWrap = document.createElement('div');
      loadMoreWrap.className = 'gallery-load-more-wrap';
      const loadBtn = document.createElement('button');
      loadBtn.className = 'gallery-load-btn';
      loadBtn.textContent = `Aur ${filtered.length - endIndex} Photos Load Karein ✨`;
      loadBtn.addEventListener('click', () => {
        currentPage++;
        renderBatch(false);
      });
      loadMoreWrap.appendChild(loadBtn);
      gridEl.appendChild(loadMoreWrap);
    }
  }

  // Infinite Scroll Listener
  let isScrollingBatch = false;
  gridEl.addEventListener('scroll', () => {
    if (isScrollingBatch) return;
    const nearBottom = gridEl.scrollTop + gridEl.clientHeight >= gridEl.scrollHeight - 300;
    const filtered = getFilteredItems();
    if (nearBottom && currentPage * BATCH_SIZE < filtered.length) {
      isScrollingBatch = true;
      currentPage++;
      renderBatch(false);
      setTimeout(() => { isScrollingBatch = false; }, 200);
    }
  }, { passive: true });

  function openGallery() {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    renderBatch(true);
  }

  function closeGallery() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  triggerBtn.addEventListener('click', openGallery);
  closeBtn.addEventListener('click', closeGallery);
  backdrop.addEventListener('click', closeGallery);

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeCategory = btn.dataset.cat;
      renderBatch(true);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeGallery();
    }
  });
}
