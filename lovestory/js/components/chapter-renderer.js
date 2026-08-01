/**
 * Chapter renderer -- turns STORY_DATA into DOM. Kept deliberately dumb:
 * no animation logic lives here (that's chapter-observer.js's job). This
 * file only decides HTML structure per `kind`, so new chapters can be
 * added to story-data.js without touching animation code.
 */

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Only for the handful of cases that need real markup (an icon entity, a
// nested span) -- everything else uses el() + textContent so story text
// can never be misinterpreted as HTML.
function elHTML(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function renderMediaItem(item, index) {
  const card = el('figure', 'memory-card');
  card.style.setProperty('--tilt', `${((index % 5) - 2) * 1.6}deg`);
  card.dataset.mediaIndex = String(index);

  if (item.type === 'video') {
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'none';
    video.poster = item.poster || '';
    video.dataset.src = item.src;
    video.onerror = () => { card.style.display = 'none'; };
    card.appendChild(video);
    const badge = elHTML('span', 'play-badge', '&#9654;');
    card.appendChild(badge);
  } else {
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = item.src;
    img.alt = '';
    img.onerror = () => { card.style.display = 'none'; };
    card.appendChild(img);
  }

  card.addEventListener('click', () => window.__openLightbox(item));
  return card;
}

function renderGallery(media) {
  if (!media || media.length === 0) return null;
  const featured = media.find((m) => m.featured);
  const rest = media.filter((m) => !m.featured);

  const wrap = document.createDocumentFragment();

  if (featured) {
    const feature = el('div', 'video-feature');
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'none';
    video.poster = featured.poster || '';
    video.dataset.src = featured.src;
    video.onerror = () => { feature.style.display = 'none'; };
    feature.appendChild(video);
    const caption = el('div', 'video-caption', 'Highlight reel');
    feature.appendChild(caption);
    feature.addEventListener('click', () => window.__openLightbox(featured));
    wrap.appendChild(feature);
  }

  // Long, fairly uniform sets (e.g. months of call screenshots) read
  // better as a horizontal filmstrip than a giant grid -- everything
  // else uses the scattered memory-card grid.
  const useStrip = rest.length > 22;
  const grid = el('div', useStrip ? 'film-strip' : 'memory-scatter');
  rest.forEach((item, i) => grid.appendChild(renderMediaItem(item, i)));
  wrap.appendChild(grid);

  return wrap;
}

function renderHero(data) {
  const section = el('section', 'hero');
  section.id = data.id;
  section.dataset.emotion = data.emotion;

  section.appendChild(el('p', 'eyebrow hero-eyebrow', data.dateLabel));
  section.appendChild(el('h1', 'hero-title', data.title));
  section.appendChild(el('p', 'hero-subtitle', data.subtitle));

  if (data.media && data.media[0]) {
    const wrap = el('div', 'hero-collage-wrap');
    const img = document.createElement('img');
    img.src = data.media[0].src;
    img.alt = '';
    img.loading = 'eager';
    img.setAttribute('fetchpriority', 'high');
    img.onerror = () => { wrap.style.display = 'none'; };
    wrap.appendChild(img);
    wrap.addEventListener('click', () => window.__openLightbox(data.media[0]));
    section.appendChild(wrap);
  }

  const cue = elHTML(
    'div',
    'scroll-cue',
    '<span>Scroll</span>'
  );
  section.appendChild(cue);

  return section;
}

function renderChapterHeader(data) {
  const header = el('div', 'chapter-header');
  if (data.number) {
    header.appendChild(
      el('span', 'chapter-number', `Chapter ${String(data.number).padStart(2, '0')}`)
    );
  }
  header.appendChild(el('p', 'eyebrow', data.dateLabel || ''));
  header.appendChild(el('h2', 'chapter-title', data.title));
  if (data.location) header.appendChild(el('p', 'chapter-location', data.location));

  if (data.milestones && data.milestones.length) {
    const pills = el('div', 'chapter-milestones');
    data.milestones.forEach((m) => pills.appendChild(el('span', 'milestone-pill', m)));
    header.appendChild(pills);
  }
  return header;
}

function renderChapter(data) {
  const section = el('section', 'chapter');
  section.id = data.id;
  section.dataset.emotion = data.emotion;
  section.dataset.kind = data.kind;

  section.appendChild(renderChapterHeader(data));

  if (data.textBeats && data.textBeats.length) {
    const body = el('div', 'chapter-body');
    data.textBeats.forEach((beat) => body.appendChild(el('p', 'story-text', beat)));
    section.appendChild(body);
  }

  const gallery = renderGallery(data.media);
  if (gallery) section.appendChild(gallery);

  return section;
}

function renderLetter(data) {
  const section = el('section', 'letter-section');
  section.id = data.id;
  section.dataset.emotion = data.emotion;

  section.appendChild(el('p', 'eyebrow', data.subtitle || ''));
  section.appendChild(el('h2', 'chapter-title', data.title));

  const envelope = elHTML(
    'div',
    'letter-envelope',
    '<div class="letter-envelope-body">Tap to open</div>'
  );
  section.appendChild(envelope);
  section.appendChild(el('p', 'letter-hint', 'Kholne ke liye tap karein'));

  const paper = el('div', 'letter-paper');
  const img = document.createElement('img');
  img.src = data.media[0].src;
  img.alt = 'Our Contract';
  img.loading = 'lazy';
  img.onerror = () => { paper.innerHTML = ''; paper.appendChild(el('p', 'story-text', 'Kuch cheezein sirf yaadon mein rehti hain.')); };
  paper.appendChild(img);
  section.appendChild(paper);

  envelope.addEventListener('click', () => {
    envelope.style.display = 'none';
    section.querySelector('.letter-hint').style.display = 'none';
    paper.classList.add('is-open');
    if (window.gsap) {
      window.gsap.to(paper, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' });
    } else {
      paper.style.opacity = 1;
      paper.style.transform = 'none';
    }
  });

  return section;
}

function renderClosing(data) {
  const section = el('section', 'closing');
  section.id = data.id;
  section.dataset.emotion = data.emotion;

  if (data.media && data.media[0]) {
    const wrap = el('div', 'closing-collage-wrap');
    const img = document.createElement('img');
    img.src = data.media[0].src;
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => { wrap.style.display = 'none'; };
    wrap.appendChild(img);
    wrap.addEventListener('click', () => window.__openLightbox(data.media[0]));
    section.appendChild(wrap);
  }

  section.appendChild(el('h2', 'closing-title', data.text));
  section.appendChild(el('p', 'closing-sub', data.title));

  if (data.friendshipDate && data.relationshipDate) {
    const dualWrap = el('div', 'dual-counters-wrapper');

    const createCard = (title, sub, dateStr, totalLabel) => {
      const card = el('div', 'days-counter days-counter-card');
      card.dataset.since = dateStr;

      const titleWrap = el('div', 'counter-title-wrap');
      titleWrap.appendChild(el('div', 'counter-header-title', title));
      titleWrap.appendChild(el('div', 'counter-header-sub', sub));
      card.appendChild(titleWrap);

      const totalWrap = el('div', 'counter-total-days');
      const bigNum = el('div', 'counter-big-num', '0');
      bigNum.dataset.unit = 'totalDays';
      totalWrap.appendChild(bigNum);
      totalWrap.appendChild(el('div', 'counter-big-label', totalLabel));
      card.appendChild(totalWrap);

      const grid = el('div', 'counter-breakdown-grid');
      const unitDefs = [
        ['years', 'SAAL'],
        ['months', 'MAHINE'],
        ['days', 'DIN'],
        ['hours', 'GHANTE'],
        ['minutes', 'MINUTE'],
        ['seconds', 'SECOND'],
      ];
      unitDefs.forEach(([key, label]) => {
        const u = el('div', 'counter-unit');
        const num = el('span', 'counter-num', '0');
        num.dataset.unit = key;
        u.appendChild(num);
        u.appendChild(el('div', 'counter-lbl', label));
        grid.appendChild(u);
      });
      card.appendChild(grid);
      return card;
    };

    dualWrap.appendChild(createCard('Dosti Ki Shuruaat', data.friendshipLabel || '4 October 2024 se dosti', data.friendshipDate, 'Kul Din Dosti Ke'));
    dualWrap.appendChild(createCard('Hamesha Ka Saath', data.relationshipLabel || '11 April 2025 se saath', data.relationshipDate, 'Kul Din Saath Mein'));
    section.appendChild(dualWrap);
  } else {
    const counter = el('div', 'days-counter');
    counter.dataset.since = data.relationshipDate || data.sinceDate || '2025-04-11';

    const unitsWrap = el('div', 'counter-units');
    const unitDefs = [
      ['years', 'SAAL'],
      ['months', 'MAHINE'],
      ['days', 'DIN'],
      ['hours', 'GHANTE'],
      ['minutes', 'MINUTE'],
      ['seconds', 'SECOND'],
    ];

    unitDefs.forEach(([key, label]) => {
      const unit = el('div', 'counter-unit');
      const value = el('span', 'counter-value', '0');
      value.dataset.unit = key;
      const unitLabel = el('span', 'counter-unit-label', label);
      unit.appendChild(value);
      unit.appendChild(unitLabel);
      unitsWrap.appendChild(unit);
    });

    counter.appendChild(unitsWrap);
    counter.appendChild(el('p', 'days-counter-since', data.relationshipLabel || '11 April 2025 se saath'));
    section.appendChild(counter);
  }

  return section;
}

export function renderStory(storyData, mountEl) {
  storyData.forEach((entry) => {
    let node;
    switch (entry.kind) {
      case 'hero':
        node = renderHero(entry);
        break;
      case 'letter':
        node = renderLetter(entry);
        break;
      case 'closing':
        node = renderClosing(entry);
        break;
      default:
        node = renderChapter(entry);
    }
    mountEl.appendChild(node);
  });
}
