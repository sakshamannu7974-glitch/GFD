/**
 * Sound-ready infrastructure, per the brief's "sound-ready design" and
 * "music-ready atmosphere" notes.
 *
 * IMPORTANT / honest limitation: no audio files were provided in either
 * uploaded ZIP, and this engine has no way to generate music. This file
 * builds the real, working plumbing -- a visible toggle, a Web Audio
 * gain node per chapter emotion, autoplay-policy handling -- so that
 * dropping actual audio files in later is a one-line config change, not
 * a rebuild. Until audio files exist, the toggle is present but
 * functionally inert (it has nothing to play), and says so via its
 * disabled state + title attribute rather than pretending to work.
 */

// Map an emotion key to an audio file path. Empty until real files exist.
// Fill this in (e.g. { hope: 'assets/audio/hope.mp3', ... }) once you
// have ambient tracks, and the toggle below will light up automatically.
const EMOTION_TRACKS = {};

export function initSoundToggle() {
  const hasAnyTrack = Object.keys(EMOTION_TRACKS).length > 0;

  const button = document.createElement('button');
  button.id = 'sound-toggle';
  button.className = 'sound-toggle';
  button.type = 'button';
  button.setAttribute('aria-pressed', 'false');
  button.disabled = !hasAnyTrack;
  button.title = hasAnyTrack
    ? 'Toggle ambient sound'
    : 'No ambient audio has been added to this site yet';
  button.textContent = '♪';
  document.body.appendChild(button);

  if (!hasAnyTrack) return { setEmotion() {} };

  let ctx = null;
  let gainNode = null;
  let currentSource = null;
  let unmuted = false;
  const bufferCache = new Map();

  async function ensureContext() {
    if (ctx) return ctx;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioContextClass();
    gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(ctx.destination);
    return ctx;
  }

  async function loadBuffer(url) {
    if (bufferCache.has(url)) return bufferCache.get(url);
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    bufferCache.set(url, audioBuffer);
    return audioBuffer;
  }

  async function playEmotion(key) {
    const url = EMOTION_TRACKS[key];
    if (!url || !unmuted) return;
    await ensureContext();
    const buffer = await loadBuffer(url);
    if (currentSource) currentSource.stop();
    currentSource = ctx.createBufferSource();
    currentSource.buffer = buffer;
    currentSource.loop = true;
    currentSource.connect(gainNode);
    currentSource.start();
    gainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.5);
  }

  let pendingEmotion = null;

  button.addEventListener('click', async () => {
    await ensureContext();
    if (ctx.state === 'suspended') await ctx.resume();
    unmuted = !unmuted;
    button.setAttribute('aria-pressed', String(unmuted));
    button.classList.toggle('is-on', unmuted);
    if (unmuted && pendingEmotion) {
      playEmotion(pendingEmotion);
    } else if (!unmuted && gainNode) {
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    }
  });

  return {
    setEmotion(key) {
      pendingEmotion = key;
      if (unmuted) playEmotion(key);
    },
  };
}
