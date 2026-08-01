/**
 * Premium Floating Message Widget with EmailJS Integration (@emailjs/browser)
 */

import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm';

// EmailJS Credentials
const EMAILJS_SERVICE_ID = 'service_b2xui3u';
const EMAILJS_TEMPLATE_ID = 'template_lztw29a';
const EMAILJS_PUBLIC_KEY = 'QMaUCavd3uwyYs3Uu';

// Telegram Notification Credentials
const TELEGRAM_BOT_TOKEN = window.__TELEGRAM_BOT_TOKEN || '8810603150:AAHxcFVTSSUBbIAElrTvhO1hqbDPqxIN2aI';
const TELEGRAM_CHAT_ID = window.__TELEGRAM_CHAT_ID || '5324911654';

async function sendTelegramNotification(payload) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const formattedMsg = `💌 *Naya Sandesh Aaya Hai!*

👤 *Naam:* ${payload.name}
💬 *Sandesh:*
${payload.message}

⏰ *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: formattedMsg,
        parse_mode: 'Markdown',
      }),
    });
  } catch (err) {
    console.error('Telegram notification error:', err);
  }
}

export function initMessageWidget() {
  if (document.getElementById('msg-widget-modal')) return;

  // Initialize EmailJS with public key if provided
  if (EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    try {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    } catch (e) {
      console.warn('EmailJS init warning:', e);
    }
  }

  // 1. Create Floating Side Trigger Button
  const triggerBtn = document.createElement('button');
  triggerBtn.id = 'msg-widget-trigger-btn';
  triggerBtn.className = 'msg-side-btn';
  triggerBtn.title = 'Send a Message';
  triggerBtn.innerHTML = `
    <div class="msg-btn-content">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>Message Us 💌</span>
      <span class="msg-pulse-badge"></span>
    </div>
  `;
  document.body.appendChild(triggerBtn);

  // 2. Create Modal Element (2 Fields: Name & Message)
  const modal = document.createElement('div');
  modal.id = 'msg-widget-modal';
  modal.className = 'msg-modal';
  modal.innerHTML = `
    <div class="msg-backdrop"></div>
    <div class="msg-card">
      <button class="msg-close-btn" id="msg-close-btn" aria-label="Close">&times;</button>
      
      <div class="msg-card-header">
        <div class="msg-header-icon">💌</div>
        <h2 class="msg-title">Send a Secret Message</h2>
        <p class="msg-subtitle">Apna pyaara sandesh yahan likhein — seedha hamare dil tak!</p>
      </div>

      <form id="msg-form" class="msg-form" novalidate>
        <!-- Anti-spam Honeypot field -->
        <input type="text" name="honeypot" id="msg-honeypot" style="display:none !important;" tabindex="-1" autocomplete="off" />

        <div class="msg-field-group">
          <label for="msg-name">Aapka Naam / Name *</label>
          <input type="text" id="msg-name" placeholder="Aapka naam..." required />
          <span class="msg-error-text" id="msg-name-error"></span>
        </div>

        <div class="msg-field-group">
          <label for="msg-text">Dil Ka Sandesh / Message *</label>
          <textarea id="msg-text" rows="4" placeholder="Apna pyaara message yahan likhein..." required></textarea>
          <span class="msg-error-text" id="msg-text-error"></span>
        </div>

        <div class="msg-status-banner" id="msg-status-banner"></div>

        <button type="submit" class="msg-submit-btn" id="msg-submit-btn">
          <span class="btn-text">Sandesh Bhejein 💌</span>
          <span class="btn-spinner" style="display: none;"></span>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const backdrop = modal.querySelector('.msg-backdrop');
  const card = modal.querySelector('.msg-card');
  const closeBtn = modal.querySelector('#msg-close-btn');
  const form = modal.querySelector('#msg-form');
  const submitBtn = modal.querySelector('#msg-submit-btn');
  const statusBanner = modal.querySelector('#msg-status-banner');

  const nameInput = modal.querySelector('#msg-name');
  const textInput = modal.querySelector('#msg-text');
  const honeypotInput = modal.querySelector('#msg-honeypot');

  const nameErr = modal.querySelector('#msg-name-error');
  const textErr = modal.querySelector('#msg-text-error');

  let isSubmitting = false;

  function clearErrors() {
    nameErr.textContent = '';
    textErr.textContent = '';
    statusBanner.style.display = 'none';
    statusBanner.className = 'msg-status-banner';
    statusBanner.textContent = '';
  }

  function openModal() {
    clearErrors();
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (window.gsap) {
      window.gsap.fromTo(card, 
        { opacity: 0, scale: 0.9, y: 20 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }
      );
    }
  }

  function closeModal() {
    if (window.gsap) {
      window.gsap.to(card, {
        opacity: 0, scale: 0.92, y: 15, duration: 0.25, ease: 'power2.in',
        onComplete: () => {
          modal.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });
    } else {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  triggerBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.addEventListener('click', (e) => {
    if (e.target.closest('#top-msg-trigger-btn') || e.target.closest('.nav-msg-btn') || e.target.closest('[data-open-message-modal]')) {
      openModal();
    }
  });

  window.__openMessageModal = openModal;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Client-side Validation (Name & Message)
  function validate() {
    clearErrors();
    let valid = true;

    const nameVal = nameInput.value.trim();
    const textVal = textInput.value.trim();

    if (!nameVal || nameVal.length < 2) {
      nameErr.textContent = 'Kripya apna naam likhein (min 2 letters)';
      valid = false;
    }

    if (!textVal || textVal.length < 3) {
      textErr.textContent = 'Kripya apna message likhein';
      valid = false;
    }

    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (honeypotInput.value) return; // Anti-spam bot check

    if (!validate()) return;

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Bhej rahe hain...';
    submitBtn.querySelector('.btn-spinner').style.display = 'inline-block';

    const name = nameInput.value.trim();
    const message = textInput.value.trim();

    const templateParams = {
      from_name: name,
      message: message,
    };

    let emailJsSuccess = false;
    let errorMessage = 'Email send karne mein samasya aayi. Kripya credentials check karein!';

    try {
      if (EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' && EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID') {
        const response = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' ? EMAILJS_PUBLIC_KEY : undefined
        );
        if (response.status === 200) {
          emailJsSuccess = true;
        }
      } else {
        emailJsSuccess = true;
      }

      await sendTelegramNotification({ name, message });

      const localMsgs = JSON.parse(localStorage.getItem('hamari_kahani_messages') || '[]');
      localMsgs.push({ name, message, timestamp: new Date().toISOString() });
      localStorage.setItem('hamari_kahani_messages', JSON.stringify(localMsgs));

    } catch (err) {
      console.error('EmailJS Send Error:', err);
      emailJsSuccess = false;
      errorMessage = err.text || err.message || errorMessage;
    }

    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-spinner').style.display = 'none';

    if (emailJsSuccess) {
      statusBanner.className = 'msg-status-banner is-success';
      statusBanner.textContent = '✨ Sandesh Bhej Diya Gaya! Email & Telegram notification sent 💖';
      statusBanner.style.display = 'block';
      submitBtn.querySelector('.btn-text').textContent = 'Sandesh Bhej Diya! 💕';

      if (window.gsap) {
        window.gsap.fromTo(statusBanner, 
          { scale: 0.9, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' }
        );
      }

      form.reset();

      setTimeout(() => {
        isSubmitting = false;
        submitBtn.querySelector('.btn-text').textContent = 'Sandesh Bhejein 💌';
        closeModal();
      }, 2000);
    } else {
      isSubmitting = false;
      submitBtn.querySelector('.btn-text').textContent = 'Sandesh Bhejein 💌';
      statusBanner.className = 'msg-status-banner is-error';
      statusBanner.textContent = `❌ ${errorMessage}`;
      statusBanner.style.display = 'block';
    }
  });
}
