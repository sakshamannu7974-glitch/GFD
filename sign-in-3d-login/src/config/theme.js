/**
 * Design tokens for the experience.
 * Mirrors the CSS custom properties in styles/tokens.css so JS-driven
 * (three.js / canvas) surfaces and DOM/CSS surfaces always stay in sync.
 */
export const theme = {
  color: {
    stageBg: '#000000',
    cardFace: '#0B0D14',
    cardFaceActive: '#10131E',
    cardRimIdle: '#222736',
    cardRimAttached: '#60A5FA',
    cardRimReleased: '#3B82F6',
    accent: '#3B82F6',
    accentBright: '#60A5FA',
    accentDeep: '#1D4ED8',
    accentGlow: 'rgba(96, 165, 250, 0.35)',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    rimLight: '#89B3F8',
  },
  font: {
    family:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif",
  },
}

/**
 * Camera & lighting setup for the 3D stage.
 */
export const sceneConfig = {
  camera: {
    position: [0, 1.45, 6.2],
    fov: 38,
  },
  cameraMobile: {
    position: [0, 1.5, 8.4],
    fov: 42,
  },
  lights: {
    ambient: { intensity: 0.75 },
    key: {
      position: [5, 7, 6],
      intensity: 1.4,
      shadowMapSize: 2048,
      shadowBias: -0.0005,
    },
    fill: { position: [-4, 4, -4], intensity: 0.5, color: '#89B3F8' },
    point: { position: [0, 4, 3], intensity: 0.6, color: '#FFFFFF' },
  },
  contactShadows: {
    position: [0, 0, 0],
    opacity: 0.75,
    scale: 16,
    blur: 1.8,
    far: 1.5,
    resolution: 1024,
    color: '#000000',
  },
  orbitControls: {
    enableZoom: false,
    enablePan: false,
    maxPolarAngle: Math.PI / 2 + 0.04,
    minPolarAngle: Math.PI / 2 - 0.25,
    target: [0, 1.1, 0],
  },
}

/**
 * Storyline timeline (seconds, relative to when the character becomes visible).
 * Kept as named constants so the animation logic in useCharacterStoryline
 * reads like a script rather than a wall of magic numbers.
 */
export const timeline = {
  formRestX: 4.28, // form parked off-screen right, waiting to be delivered
  formCenterX: 0.0,

  walkIn: { start: 0, end: 1.8, fromX: -4.2, toX: -1.2 },
  greet: {
    start: 1.8,
    end: 4.4,
    x: -1.2,
    message: 'Wait a second! Let me grab the login form for you! 👋',
  },
  crossOver: { start: 4.4, end: 6.4, fromX: -1.2, toX: 2.73 },
  pullForm: { start: 6.4, end: 12.0, fromCharX: 2.73, toCharX: -1.5 },
  delivered: {
    start: 12.0,
    charX: -1.5,
    message: 'Here is your form! ✨',
  },
}

/** Total intro duration in ms — used to size the "Skip intro" affordance. */
export const INTRO_DURATION_MS = timeline.delivered.start * 1000
