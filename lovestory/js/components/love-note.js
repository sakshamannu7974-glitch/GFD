/**
 * Love Note & Collage Module
 * Floating button & romantic heart-touching message box with collage photo
 */

export function initLoveNote() {
  if (document.getElementById('love-note-modal')) return;

  // 1. Create Side Floating Trigger Button
  const triggerBtn = document.createElement('button');
  triggerBtn.id = 'love-note-trigger-btn';
  triggerBtn.className = 'love-note-side-btn';
  triggerBtn.title = 'Pyar Bhara Paigham (Secret Love Note)';
  triggerBtn.innerHTML = `
    <span class="btn-icon">💌</span>
    <span>Special Message</span>
  `;
  document.body.appendChild(triggerBtn);

  // 2. Create Modal Element
  const modal = document.createElement('div');
  modal.id = 'love-note-modal';
  modal.className = 'love-note-modal';
  modal.innerHTML = `
    <div class="love-note-backdrop"></div>
    <div class="love-note-content">
      <button class="love-note-close-btn" id="love-note-close-btn" aria-label="Close">&times;</button>
      
      <div class="love-note-header">
        <span class="love-note-badge">💖 SPECIAL LOVE NOTE</span>
        <h2 class="love-note-title">Meri Taraf Se Tumhare Liye... 💌</h2>
        <p class="love-note-sub">Sirf tumhare liye ek pyara sa, dil se likha hua paigham</p>
      </div>

      <div class="love-note-body">
        <div class="love-note-collage-wrap">
          <img src="assets/images/coda-her/girlfriends-day.jpg" alt="Our Special Memory" class="love-note-img" id="love-note-img" />
          <div class="love-note-img-caption">Happy Girlfriend's Day 💖 — Today, Tomorrow & Forever</div>
        </div>

        <div class="love-note-letter">
          <div class="letter-greeting">Meri Jaan, Meri Sab Kuch... 💖</div>
          <p class="letter-para">
            Gaming platform pe ek chhota sa <i>"Hello"</i> bolne se lekar aaj tak, tum meri zindagi ka sabse khoobsurat aur pyara hissa ban chuki ho.
          </p>
          <p class="letter-para">
            Pata nahi kab do anjaani zindagiyan itni gehri dosti mein badal gayi, aur kab wo dosti mere dil ki sabse badi zaroorat ban gayi. <b>4 October 2024</b> ko shuru hua ye safar, <b>11 April 2025</b> ke us magical <i>"YES"</i> ke baad aur bhi khoobsurat ho gaya.
          </p>
          <p class="letter-para">
            Tumhari chhoti-chhoti baatein, tumhara bewajah muskuraana, mera khayal rakhna, aur har mushkil waqt mein mere saath khade rehna — ye sab mujhe har din tumse aur zyada pyar karne pe majboor kar deta hai.
          </p>
          <p class="letter-para">
            Chahe kitni bhi doori ho, ya kitne bhi ups and downs aayein... mera dil hamesha sirf tumhare paas hi rehta hai. Thank you meri life mein aane ke liye, mujhe itna samjhne aur pyar dene ke liye, aur meri duniya ko itna khoobsurat banane ke liye.
          </p>
          <div class="letter-footer">
            <div class="letter-highlight">I Love You So Much... Today, Tomorrow & Forever! 💖✨</div>
            <div class="letter-sign">— Hamesha Tumhara 🌹</div>
          </div>
        </div>
      </div>

      <div class="love-note-actions">
        <button class="love-send-hearts-btn" id="love-send-hearts-btn">
          <span>💖 Pyar Bhejo (Shower Hearts)</span>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('#love-note-close-btn');
  const backdrop = modal.querySelector('.love-note-backdrop');
  const imgEl = modal.querySelector('#love-note-img');
  const sendHeartsBtn = modal.querySelector('#love-send-hearts-btn');

  function openModal() {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    spawnFloatingHearts(modal.querySelector('.love-note-content'), 8);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  triggerBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  imgEl.addEventListener('click', () => {
    if (window.__openLightbox) {
      window.__openLightbox({
        src: 'assets/images/coda-her/girlfriends-day.jpg',
        title: "Happy Girlfriend's Day 💖"
      });
    }
  });

  sendHeartsBtn.addEventListener('click', () => {
    triggerHeartShower();
    sendHeartsBtn.classList.add('pulse');
    setTimeout(() => sendHeartsBtn.classList.remove('pulse'), 600);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

function spawnFloatingHearts(container, count = 6) {
  const emojis = ['💖', '💕', '💗', '💓', '✨', '🌹'];
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-note-heart';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = `${Math.random() * 85 + 5}%`;
    heart.style.animationDuration = `${Math.random() * 2 + 2.5}s`;
    heart.style.fontSize = `${Math.random() * 12 + 16}px`;
    container.appendChild(heart);

    setTimeout(() => heart.remove(), 4000);
  }
}

function triggerHeartShower() {
  const container = document.body;
  const emojis = ['💖', '❤️', '💕', '💗', '💓', '💞', '✨', '🌹'];
  for (let i = 0; i < 35; i++) {
    setTimeout(() => {
      const heart = document.createElement('div');
      heart.className = 'screen-heart-shower';
      heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      heart.style.left = `${Math.random() * 95}%`;
      heart.style.top = `${Math.random() * 20 + 80}%`;
      heart.style.fontSize = `${Math.random() * 20 + 20}px`;
      container.appendChild(heart);

      setTimeout(() => heart.remove(), 2500);
    }, i * 60);
  }
}
