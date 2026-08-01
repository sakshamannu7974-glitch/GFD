/**
 * Premium Ambient Floating Particle Engine
 *
 * Soft, round, glowing dots that drift gently across the viewport.
 * Each particle fades in, floats on a sine-curved path, and fades
 * out — creating a firefly / dust-mote / aurora aesthetic.
 *
 * Rules:
 * 1. Spawn smoothly from random positions around screen edges.
 * 2. Rotate one full 360° over lifetime (subtle tumble).
 * 3. Smooth fade-in (first 15%) and fade-out (last 20%).
 * 4. Continuous spawning to keep the effect alive.
 * 5. Slow, elegant ease-in-out movement with micro sine drift.
 * 6. Randomized: size (2px-7px), opacity (0.25-0.7), lifetime (8s-17s).
 * 7. Glowing box-shadow synced with CSS emotion tokens.
 * 8. Fixed z-index 1, pointer-events: none.
 * 9. GPU-accelerated via translate3d + rotate.
 * 10. ~40-50 on desktop, ~25 on mobile.
 * 11. No sudden disappearances; elegant opacity envelope.
 * 12. Cinematic, premium Apple/Framer/Linear feel.
 * 13. Cross-viewport edge-to-edge paths.
 * 14. Responsive auto-scaling and tab-switch pausing.
 */

const EMOTION_PROFILES = {
  friendship: { count: 45, minSpeed: 9000, maxSpeed: 16000 },
  hope: { count: 50, minSpeed: 8000, maxSpeed: 15000 },
  love: { count: 50, minSpeed: 9000, maxSpeed: 16000 },
  firstmeeting: { count: 55, minSpeed: 8000, maxSpeed: 14000 },
  travel: { count: 40, minSpeed: 7000, maxSpeed: 13000 },
  temple: { count: 45, minSpeed: 10000, maxSpeed: 17000 },
  joy: { count: 52, minSpeed: 8000, maxSpeed: 15000 },
  sad: { count: 25, minSpeed: 12000, maxSpeed: 20000 },
  future: { count: 50, minSpeed: 9000, maxSpeed: 16000 },
};

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function initParticles() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return { setEmotion() {} };
  }

  // Ensure particle container exists
  let container = document.getElementById('particle-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'particle-container';
    document.body.prepend(container);
  }

  // Remove legacy canvas if present
  const oldCanvas = document.getElementById('particle-canvas');
  if (oldCanvas) oldCanvas.remove();

  let width = window.innerWidth;
  let height = window.innerHeight;
  let particles = [];
  let elementPool = [];
  let currentProfile = EMOTION_PROFILES.friendship;
  let running = true;
  let animFrameId = null;

  function getMaxParticles() {
    const isMobile = width < 768;
    const baseCount = currentProfile.count || 45;
    return isMobile ? Math.min(baseCount, 28) : baseCount;
  }

  function getParticleElement() {
    if (elementPool.length > 0) {
      const el = elementPool.pop();
      el.style.display = 'block';
      return el;
    }
    const el = document.createElement('div');
    el.className = 'particle-dot';
    container.appendChild(el);
    return el;
  }

  function recycleParticleElement(el) {
    el.style.display = 'none';
    el.style.transform = 'translate3d(-9999px, -9999px, 0)';
    el.style.opacity = '0';
    elementPool.push(el);
  }

  function createParticle(seedProgress = 0) {
    const targetEdge = Math.floor(Math.random() * 4); // 0: Top, 1: Right, 2: Bottom, 3: Left
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const margin = 40;

    switch (targetEdge) {
      case 0: // Spawn Top edge -> target Bottom
        startX = Math.random() * width;
        startY = -margin;
        endX = startX + (Math.random() - 0.5) * (width * 0.6);
        endY = height + margin;
        break;
      case 1: // Spawn Right edge -> target Left
        startX = width + margin;
        startY = Math.random() * height;
        endX = -margin;
        endY = startY + (Math.random() - 0.5) * (height * 0.6);
        break;
      case 2: // Spawn Bottom edge -> target Top
        startX = Math.random() * width;
        startY = height + margin;
        endX = startX + (Math.random() - 0.5) * (width * 0.6);
        endY = -margin;
        break;
      case 3: // Spawn Left edge -> target Right
      default:
        startX = -margin;
        startY = Math.random() * height;
        endX = width + margin;
        endY = startY + (Math.random() - 0.5) * (height * 0.6);
        break;
    }

    const duration = Math.random() * (currentProfile.maxSpeed - currentProfile.minSpeed) + currentProfile.minSpeed;
    const now = performance.now();
    // When initial seeding, randomize start time in the past to distribute particles across screen immediately
    const startTime = now - seedProgress * duration;

    const el = getParticleElement();
    const size = (Math.random() * 5 + 2).toFixed(1); // 2px to 7px
    el.style.setProperty('--size', `${size}px`);

    const initialRotation = Math.random() * 360;
    const rotationDir = Math.random() < 0.5 ? 1 : -1;
    const maxOpacity = Math.random() * 0.45 + 0.25; // 0.25 to 0.7

    return {
      el,
      startX,
      startY,
      endX,
      endY,
      duration,
      startTime,
      initialRotation,
      rotationDir,
      maxOpacity,
      driftAmplitude: Math.random() * 25 + 10,
      sineFreq: Math.random() * 1.5 + 0.8,
      sinePhase: Math.random() * Math.PI * 2,
    };
  }

  function seedParticles() {
    const maxCount = getMaxParticles();
    particles.forEach(p => recycleParticleElement(p.el));
    particles = [];

    for (let i = 0; i < maxCount; i++) {
      particles.push(createParticle(Math.random()));
    }
  }

  function update() {
    if (!running) return;
    const now = performance.now();
    const maxCount = getMaxParticles();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const elapsed = now - p.startTime;
      const progress = elapsed / p.duration;

      if (progress >= 1) {
        recycleParticleElement(p.el);
        particles.splice(i, 1);
        continue;
      }

      // Movement trajectory with ease-in-out and subtle sine drift
      const eased = easeInOutCubic(progress);
      const sineWave = Math.sin(progress * Math.PI * 2 * p.sineFreq + p.sinePhase) * p.driftAmplitude;

      const currentX = p.startX + (p.endX - p.startX) * eased + sineWave;
      const currentY = p.startY + (p.endY - p.startY) * eased;

      // Exactly 1 full 360 degree rotation over lifetime
      const currentRotation = p.initialRotation + p.rotationDir * 360 * progress;

      // Luxurious scale progression: 0.8 -> 1.1 -> 0.8 curve
      const currentScale = 0.8 + 0.3 * Math.sin(progress * Math.PI);

      // Smooth opacity envelope: fade in (0-15%), full opacity (15-80%), fade out (80-100%)
      let opacity = 0;
      if (progress < 0.15) {
        opacity = (progress / 0.15) * p.maxOpacity;
      } else if (progress > 0.8) {
        opacity = ((1 - progress) / 0.2) * p.maxOpacity;
      } else {
        opacity = p.maxOpacity;
      }

      // Hardware accelerated transform with translate3d, rotate, and scale
      p.el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) rotate(${currentRotation.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`;
      p.el.style.opacity = opacity.toFixed(3);
    }

    // Continuously spawn new particles to maintain target density
    while (particles.length < maxCount) {
      particles.push(createParticle(0));
    }

    animFrameId = requestAnimationFrame(update);
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
  }

  resize();
  seedParticles();
  animFrameId = requestAnimationFrame(update);

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
    if (running) {
      const now = performance.now();
      particles.forEach(p => { p.startTime = now - Math.random() * p.duration * 0.5; });
      animFrameId = requestAnimationFrame(update);
    } else if (animFrameId) {
      cancelAnimationFrame(animFrameId);
    }
  });

  return {
    setEmotion(key) {
      const next = EMOTION_PROFILES[key] || EMOTION_PROFILES.friendship;
      if (next === currentProfile) return;
      currentProfile = next;
    },
  };
}

