/**
 * World of Love Module -- 100+ Languages of "I Love You"
 * Floating button & interactive searchable modal
 */

const LOVE_LANGUAGES = [
  // India & South Asia
  { flag: '🇮🇳', lang: 'Hindi', phrase: 'Mujhe Tumse Pyar Hai', script: 'मुझे तुमसे प्यार है', region: 'India' },
  { flag: '🇮🇳', lang: 'Punjabi', phrase: 'Main Tainu Pyar Karda Haan', script: 'ਮੈਂ ਤੈਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹਾਂ', region: 'India' },
  { flag: '🇮🇳', lang: 'Bengali', phrase: 'Ami Tomake Bhalobashi', script: 'আমি তোমাকে ভালোবাসি', region: 'India / Bangladesh' },
  { flag: '🇮🇳', lang: 'Marathi', phrase: 'Me Tujhya Var Prem Kartot', script: 'मी तुझ्यावर प्रेम करतो', region: 'India' },
  { flag: '🇮🇳', lang: 'Gujarati', phrase: 'Hoon Tane Prem Karoon Chhoon', script: 'હું તને પ્રેમ કરું છું', region: 'India' },
  { flag: '🇮🇳', lang: 'Tamil', phrase: 'Naan Unnai Kaadhalikkiren', script: 'நான் உன்னைக் காதலிக்கிறேன்', region: 'India / Sri Lanka' },
  { flag: '🇮🇳', lang: 'Telugu', phrase: 'Nenu Ninnu Premistunnanu', script: 'నేను నిన్ను ప్రేమిస్తున్నాను', region: 'India' },
  { flag: '🇮🇳', lang: 'Kannada', phrase: 'Naanu Ninnannu Preetisuttene', script: 'நானு நின்னன்னு பிரீதிசுத்தேனே', region: 'India' },
  { flag: '🇮🇳', lang: 'Malayalam', phrase: 'Njan Ninne Snehikkunnu', script: 'ഞാൻ നിന്നെ സ്നേഹിക്കുന്നു', region: 'India' },
  { flag: '🇮🇳', lang: 'Urdu', phrase: 'Mujhe Aap Se Mohabbat Hai', script: 'مجھے آپ سے محبت ہے', region: 'India / Pakistan' },
  { flag: '🇮🇳', lang: 'Odia', phrase: 'Mu Tumaku Bhala Pae', script: 'ମୁଁ ତୁମକୁ ଭଲ ପାଏ', region: 'India' },
  { flag: '🇮🇳', lang: 'Sanskrit', phrase: 'Aham Tvayi Snihyami', script: 'अहम् त्वयि स्निह्यामि', region: 'India' },
  { flag: '🇮🇳', lang: 'Haryanvi', phrase: 'Main Tanne Pyar Karun Su', script: 'मैं तन्ने प्यार करूँ सू', region: 'India' },
  { flag: '🇮🇳', lang: 'Rajasthani', phrase: 'Main Tane Pyar Karu Hu', script: 'मैं तने प्यार करूँ हूँ', region: 'India' },
  { flag: '🇮🇳', lang: 'Bhojpuri', phrase: 'Hum Tohra Se Pyar Kareni', script: 'हम तोहरा से प्यार करेनी', region: 'India' },
  { flag: '🇮🇳', lang: 'Maithili', phrase: 'Hum Tohra Se Prem Karait Chhi', script: 'हम तोरा से प्रेम करैत छी', region: 'India' },
  { flag: '🇮🇳', lang: 'Assamese', phrase: 'Moi Tomak Bhal Pao', script: 'মই তোমাক ভাল পাওঁ', region: 'India' },
  { flag: '🇳🇵', lang: 'Nepali', phrase: 'Ma Timilai Maya Garchhu', script: 'म तिमीलाई माया गर्छु', region: 'Nepal' },
  { flag: '🇱🇰', lang: 'Sinhala', phrase: 'Mama Oyata Aadarei', script: 'මම ඔයාට ආදරෙයි', region: 'Sri Lanka' },

  // Europe & Americas
  { flag: '🇬🇧', lang: 'English', phrase: 'I Love You', script: 'I Love You', region: 'Worldwide' },
  { flag: '🇫🇷', lang: 'French', phrase: "Je t'aime", script: "Je t'aime", region: 'France / Canada' },
  { flag: '🇪🇸', lang: 'Spanish', phrase: 'Te amo / Te quiero', script: 'Te amo', region: 'Spain / Latin America' },
  { flag: '🇮🇹', lang: 'Italian', phrase: 'Ti amo', script: 'Ti amo', region: 'Italy' },
  { flag: '🇩🇪', lang: 'German', phrase: 'Ich liebe dich', script: 'Ich liebe dich', region: 'Germany / Austria' },
  { flag: '🇵🇹', lang: 'Portuguese', phrase: 'Eu te amo', script: 'Eu te amo', region: 'Portugal / Brazil' },
  { flag: '🇳🇱', lang: 'Dutch', phrase: 'Ik hou van jou', script: 'Ik hou van jou', region: 'Netherlands' },
  { flag: '🇬🇷', lang: 'Greek', phrase: 'Se agapo', script: 'Σε αγαπώ', region: 'Greece' },
  { flag: '🇷🇺', lang: 'Russian', phrase: 'Ya tebya lyublyu', script: 'Я тебя люблю', region: 'Russia' },
  { flag: '🇺🇦', lang: 'Ukrainian', phrase: 'Ya tebe kokhayu', script: 'Я тебе кохаю', region: 'Ukraine' },
  { flag: '🇵🇱', lang: 'Polish', phrase: 'Kocham Cię', script: 'Kocham Cię', region: 'Poland' },
  { flag: '🇸🇪', lang: 'Swedish', phrase: 'Jag älskar dig', script: 'Jag älskar dig', region: 'Sweden' },
  { flag: '🇳🇴', lang: 'Norwegian', phrase: 'Jeg elsker deg', script: 'Jeg elsker deg', region: 'Norway' },
  { flag: '🇩🇰', lang: 'Danish', phrase: 'Jeg elsker dig', script: 'Jeg elsker dig', region: 'Denmark' },
  { flag: '🇫🇮', lang: 'Finnish', phrase: 'Minä rakastan sinua', script: 'Minä rakastan sinua', region: 'Finland' },
  { flag: '🇨🇿', lang: 'Czech', phrase: 'Miluji tě', script: 'Miluji tě', region: 'Czech Republic' },
  { flag: '🇷🇴', lang: 'Romanian', phrase: 'Te iubesc', script: 'Te iubesc', region: 'Romania' },
  { flag: '🇭🇺', lang: 'Hungarian', phrase: 'Szeretlek', script: 'Szeretlek', region: 'Hungary' },
  { flag: '🇮🇪', lang: 'Irish Gaelic', phrase: 'Is breá liom tú', script: 'Is breá liom tú', region: 'Ireland' },
  { flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', lang: 'Welsh', phrase: "Rwy'n dy garu di", script: "Rwy'n dy garu di", region: 'Wales' },
  { flag: '🇭🇷', lang: 'Croatian', phrase: 'Volim te', script: 'Volim te', region: 'Croatia' },
  { flag: '🇷🇸', lang: 'Serbian', phrase: 'Volim te', script: 'Волим те', region: 'Serbia' },
  { flag: '🇧🇬', lang: 'Bulgarian', phrase: 'Obicham te', script: 'Обичам те', region: 'Bulgaria' },
  { flag: '🇸ロ', lang: 'Slovak', phrase: 'Ľúbim ťa', script: 'Ľúbim ťa', region: 'Slovakia' },
  { flag: '🇸🇮', lang: 'Slovenian', phrase: 'Ljubim te', script: 'Ljubim te', region: 'Slovenia' },
  { flag: '🇱🇹', lang: 'Lithuanian', phrase: 'Aš tave myliu', script: 'Aš tave myliu', region: 'Lithuania' },
  { flag: '🇱🇻', lang: 'Latvian', phrase: 'Es tevi mīlu', script: 'Es tevi mīlu', region: 'Latvia' },
  { flag: '🇪🇪', lang: 'Estonian', phrase: 'Ma armastan sind', script: 'Ma armastan sind', region: 'Estonia' },
  { flag: '🇮🇸', lang: 'Icelandic', phrase: 'Ég elska þig', script: 'Ég elska þig', region: 'Iceland' },
  { flag: '🇲🇹', lang: 'Maltese', phrase: 'Inħobbok', script: 'Inħobbok', region: 'Malta' },
  { flag: '🇦🇱', lang: 'Albanian', phrase: 'Të dua', script: 'Të dua', region: 'Albania' },
  { flag: '🇲🇰', lang: 'Macedonian', phrase: 'Te sakam', script: 'Те сакам', region: 'North Macedonia' },

  // East & Southeast Asia
  { flag: '🇯🇵', lang: 'Japanese', phrase: 'Aishiteru', script: '愛してる', region: 'Japan' },
  { flag: '🇰🇷', lang: 'Korean', phrase: 'Saranghae', script: '사랑해', region: 'South Korea' },
  { flag: '🇨🇳', lang: 'Mandarin Chinese', phrase: 'Wǒ ài nǐ', script: '我爱你', region: 'China / Taiwan' },
  { flag: '🇭🇰', lang: 'Cantonese', phrase: 'Ngo oi nei', script: '我愛你', region: 'Hong Kong' },
  { flag: '🇻🇳', lang: 'Vietnamese', phrase: 'Anh yêu em', script: 'Anh yêu em', region: 'Vietnam' },
  { flag: '🇹🇭', lang: 'Thai', phrase: 'Phom rak khun', script: 'ผมรักคุณ', region: 'Thailand' },
  { flag: '🇮🇩', lang: 'Indonesian', phrase: 'Aku cinta kamu', script: 'Aku cinta kamu', region: 'Indonesia' },
  { flag: '🇲🇾', lang: 'Malay', phrase: 'Saya sayang awak', script: 'Saya sayang awak', region: 'Malaysia' },
  { flag: '🇵🇭', lang: 'Filipino / Tagalog', phrase: 'Mahal kita', script: 'Mahal kita', region: 'Philippines' },
  { flag: '🇱🇦', lang: 'Lao', phrase: 'Khoi hak chao', script: 'ຂ້ອຍຮັກເຈົ້າ', region: 'Laos' },
  { flag: '🇰🇭', lang: 'Khmer', phrase: 'Knhom sro-lahn neh', script: 'ខ្ញុំស្រឡាញ់អ្នក', region: 'Cambodia' },
  { flag: '🇲🇳', lang: 'Mongolian', phrase: 'Bi nand hairtai', script: 'Би чад хайртай', region: 'Mongolia' },
  { flag: '🇲🇲', lang: 'Burmese', phrase: 'Nga nin ko chit te', script: 'ငါနင့်ကိုချစ်တယ်', region: 'Myanmar' },

  // Middle East & Central Asia
  { flag: '🇸🇦', lang: 'Arabic', phrase: 'Uhibbuki', script: 'أحبك', region: 'Arab World' },
  { flag: '🇹🇷', lang: 'Turkish', phrase: 'Seni seviyorum', script: 'Seni seviyorum', region: 'Turkey' },
  { flag: '🇮🇱', lang: 'Hebrew', phrase: 'Ani ohev otach', script: 'אני אוהב אותך', region: 'Israel' },
  { flag: '🇮🇷', lang: 'Persian / Farsi', phrase: 'Doosat daram', script: 'دوستت دارم', region: 'Iran' },
  { flag: '🇦🇲', lang: 'Armenian', phrase: 'Yes kez sirum em', script: 'Ես քեզ սիրում եմ', region: 'Armenia' },
  { flag: '🇬🇪', lang: 'Georgian', phrase: 'Mikvarkhar', script: 'მიყვარხარ', region: 'Georgia' },
  { flag: '🇦🇿', lang: 'Azerbaijani', phrase: 'Mən səni sevirəm', script: 'Mən səni sevirəm', region: 'Azerbaijan' },
  { flag: '🇰🇿', lang: 'Kazakh', phrase: 'Men seni süyemin', script: 'Мен сені сүйемін', region: 'Kazakhstan' },
  { flag: '🇺🇿', lang: 'Uzbek', phrase: 'Men seni sevaman', script: 'Men seni sevaman', region: 'Uzbekistan' },
  { flag: '🇲🇦', lang: 'Moroccan Arabic', phrase: 'Kanbghik', script: 'كنبغيك', region: 'Morocco' },
  { flag: '🇪🇬', lang: 'Egyptian Arabic', phrase: 'Bahebak', script: 'بحبك', region: 'Egypt' },

  // Africa & Pacific
  { flag: '🇰🇪', lang: 'Swahili', phrase: 'Nakupenda', script: 'Nakupenda', region: 'East Africa' },
  { flag: '🇿🇦', lang: 'Zulu', phrase: 'Ngiyakuthanda', script: 'Ngiyakuthanda', region: 'South Africa' },
  { flag: '🇿🇦', lang: 'Afrikaans', phrase: 'Ek het jou lief', script: 'Ek het jou lief', region: 'South Africa' },
  { flag: '🇪🇹', lang: 'Amharic', phrase: 'Ewebishalehu', script: 'እወድሻለሁ', region: 'Ethiopia' },
  { flag: '🇳🇬', lang: 'Yoruba', phrase: 'Mo n fe re', script: 'Mo n fe re', region: 'Nigeria' },
  { flag: '🇳🇬', lang: 'Igbo', phrase: "A hụrụ m gị n'anya", script: "A hụrụ m gị n'anya", region: 'Nigeria' },
  { flag: '🇳🇬', lang: 'Hausa', phrase: 'Ina son ki', script: 'Ina son ki', region: 'West Africa' },
  { flag: '🇲🇬', lang: 'Malagasy', phrase: 'Tiako ianao', script: 'Tiako ianao', region: 'Madagascar' },
  { flag: '🇭🇦', lang: 'Hawaiian', phrase: "Aloha wau iā 'oe", script: "Aloha wau iā 'oe", region: 'Hawaii' },
  { flag: '🇲🇦', lang: 'Samoan', phrase: 'Ou te alofa ia te oe', script: 'Ou te alofa ia te oe', region: 'Samoa' },
  { flag: '🇫🇯', lang: 'Fijian', phrase: 'Au domoni iko', script: 'Au domoni iko', region: 'Fiji' },

  // Special & Heart
  { flag: '💖', lang: 'Heart Language', phrase: 'Har Pal, Har Saans Mein Tum', script: 'हर पल, हर सांस में सिर्फ तुम 💖', region: 'Hamari Kahani' }
];

export function initWorldLove() {
  if (document.getElementById('world-love-modal')) return;

  // 1. Create Side Floating Trigger Button
  const triggerBtn = document.createElement('button');
  triggerBtn.id = 'world-love-trigger-btn';
  triggerBtn.className = 'world-love-side-btn';
  triggerBtn.title = 'World of Love (100+ Bhashayein)';
  triggerBtn.innerHTML = `
    <span class="btn-icon">🌐</span>
    <span>100+ Bhashayein</span>
  `;
  document.body.appendChild(triggerBtn);

  // 2. Create Modal Element
  const modal = document.createElement('div');
  modal.id = 'world-love-modal';
  modal.className = 'world-love-modal';
  modal.innerHTML = `
    <div class="world-love-backdrop"></div>
    <div class="world-love-content">
      <div class="world-love-header">
        <div class="world-love-title-group">
          <h2 class="world-love-main-title">🌐 Duniya Ki Har Bhasha Mein — I Love You</h2>
          <p class="world-love-sub-title">Zindagi ki har bhasha mein dil ki sirf ek hi baat hai: I Love You 💖 (<span id="world-love-badge">${LOVE_LANGUAGES.length} Bhashayein</span>)</p>
        </div>
        <button class="world-love-close-btn" id="world-love-close-btn" aria-label="Close">&times;</button>
      </div>

      <div class="world-love-search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" id="world-love-search-input" placeholder="Bhasha ya country search karein... (e.g. Hindi, French, Japan, Te amo)" />
      </div>

      <div class="world-love-grid" id="world-love-grid"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const gridEl = modal.querySelector('#world-love-grid');
  const searchInput = modal.querySelector('#world-love-search-input');
  const closeBtn = modal.querySelector('#world-love-close-btn');
  const backdrop = modal.querySelector('.world-love-backdrop');
  const badgeEl = modal.querySelector('#world-love-badge');

  function renderGrid(query = '') {
    gridEl.innerHTML = '';
    const q = query.trim().toLowerCase();

    const filtered = LOVE_LANGUAGES.filter(item => {
      if (!q) return true;
      return item.lang.toLowerCase().includes(q) ||
             item.phrase.toLowerCase().includes(q) ||
             item.script.toLowerCase().includes(q) ||
             item.region.toLowerCase().includes(q);
    });

    badgeEl.textContent = `${filtered.length} Bhashayein`;

    if (filtered.length === 0) {
      gridEl.innerHTML = `<div class="world-love-empty">Koi match nahi mila... par mera pyar tumse har bhasha mein hai! ❤️</div>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'lang-love-card';
      card.innerHTML = `
        <div class="card-top">
          <span class="card-flag">${item.flag}</span>
          <span class="card-lang">${item.lang}</span>
          <span class="card-region">${item.region}</span>
        </div>
        <div class="card-phrase">${item.phrase}</div>
        <div class="card-script">${item.script}</div>
        <div class="card-copy-hint">Tap to copy ❤️</div>
      `;

      card.addEventListener('click', () => {
        navigator.clipboard.writeText(`${item.lang}: ${item.phrase} (${item.script})`).catch(() => {});
        card.classList.add('copied');
        const originalHint = card.querySelector('.card-copy-hint').textContent;
        card.querySelector('.card-copy-hint').textContent = 'Copied to heart! 💖';
        setTimeout(() => {
          card.classList.remove('copied');
          card.querySelector('.card-copy-hint').textContent = originalHint;
        }, 1500);
      });

      fragment.appendChild(card);
    });
    gridEl.appendChild(fragment);
  }

  function openModal() {
    renderGrid();
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput.focus(), 200);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  triggerBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  searchInput.addEventListener('input', (e) => {
    renderGrid(e.target.value);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}
