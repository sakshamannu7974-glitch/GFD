# Sign In — 3D Character-Delivered Login Experience

A premium, animated sign-in page: a 3D character walks in, greets the
visitor, and physically delivers the login card to the center of the
screen — then the form becomes interactive. Built with React 19, Vite,
and `@react-three/fiber`.

---

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve the production build locally
npm run lint       # ESLint
```

Node 18+ recommended.

> **Note on this delivery:** `node_modules` is intentionally **not**
> included in this package (it's large, and the previous build's copy
> was compiled for macOS/ARM64 and won't run on other machines). Run
> `npm install` once and you're set — `package-lock.json` pins the
> exact versions this was built and lint-verified against.

---

## What changed from the original

The original was a single ~600-line `App.jsx` with inline styles for
everything. This version keeps the exact same concept and visual
design, but rebuilt for production:

| Area | What was done |
|---|---|
| **Architecture** | Split into `components/`, `hooks/`, `utils/`, `config/`, `styles/` — one responsibility per file, no file over ~150 lines |
| **Performance** | 3D scene code-split via `React.lazy` into its own chunk; three.js/react-three/react split into separate cacheable vendor bundles; asset preloading kept and made explicit; model files renamed to remove spaces (`Pull Heavy Object.fbx` → `pull-heavy-object.fbx`) |
| **Accessibility** | Real `<label for>`/`<input id>` pairing, `aria-live` status announcements, a visible "Skip intro" control, full `prefers-reduced-motion` support (skips straight to the usable form), a complete **non-WebGL fallback page** so the site never breaks, visible focus rings everywhere |
| **UX polish** | Real form validation, show/hide password, remember me, forgot-password link, submit states (idle → signing in → signed in) — replacing the original's `alert()` |
| **Code quality** | Named, documented storyline phases instead of magic numbers; a reusable crossfade action-switcher hook; design tokens shared between JS (`config/theme.js`) and CSS (`styles/tokens.css`) so the palette only lives in one place |
| **Resilience** | An `ErrorBoundary` around the 3D scene falls back to the static login page if WebGL crashes at runtime instead of showing a blank screen |

---

## Project structure

```
public/
  favicon.svg, icons.svg
  models/                 3D character + animation clips (glb/fbx)
src/
  main.jsx                React entry point
  App.jsx                 Top-level shell: WebGL check, code-split Scene, error boundary
  components/
    Scene/                Canvas, lighting, camera, composes everything below
    Character/             Loads the rig + animation clips, drives the storyline
    LoginForm/
      LoginForm.jsx         The actual accessible <form> (shared by both surfaces below)
      LoginForm3D.jsx        Wraps it in the 3D glass card the character delivers
    Fallback/
      StaticLoginPage.jsx    Non-3D page shown when WebGL isn't available
    SpeechBubble/           The character's 3D-anchored dialogue bubble
    LoadingScreen/          Shown while the 3D chunk streams in
    ErrorBoundary/          Catches 3D runtime crashes
  hooks/
    useCharacterStoryline.js   The 5-phase animation timeline (frame-by-frame)
    useActionSwitcher.js       Crossfades between animation clips
    useReducedMotion.js        Watches prefers-reduced-motion
    useWebGLSupport.js         One-time WebGL capability check
    useResponsiveViewport.js   Debounced viewport size for camera/scale adjustments
  utils/
    animationClips.js       Retargets Mixamo FBX clips onto the GLB rig
  config/
    theme.js                 Colors, camera, lighting, storyline timing — the source of truth
  styles/
    tokens.css                CSS custom properties (mirrors theme.js)
    global.css                Base reset + accessibility utilities
```

---

## Adding your own images, videos, and pages

The structure is set up so none of this requires touching existing files:

- **Images** → drop into `public/images/` (create the folder) and reference
  as `/images/your-file.jpg`. For anything below the fold or off-screen,
  use `<img loading="lazy" decoding="async" />`.
- **Videos** → `public/videos/`. Use `<video preload="metadata">` and
  only switch to `preload="auto"` for something the visitor will see
  immediately.
- **New pages** → add a folder under `src/components/` per page, and
  introduce routing (e.g. `react-router-dom`) in `App.jsx` when you're
  ready for more than one screen. The current single-page setup doesn't
  include a router since there's only one page today.
- **New 3D animations** → drop the `.fbx` into `public/models/`, add it
  to `MODEL_PATHS` in `Character.jsx`, and reference the clip name in
  `useCharacterStoryline.js`.

---

## Design tokens

Colors, timing, and the camera/lighting rig are centralized in
`src/config/theme.js` (for JS/three.js consumers) and
`src/styles/tokens.css` (for CSS consumers). Change the accent blue or
retiming the storyline in one place instead of hunting through inline
styles.

## Browser support & fallback behavior

- **WebGL available, motion OK** → full 3D storyline.
- **WebGL available, `prefers-reduced-motion: reduce`** → the character
  and card appear instantly in their final "delivered" position — no
  12-second wait before the form is usable.
- **No WebGL** (or the 3D scene throws at runtime) → the exact same
  login form, styled identically, on a plain gradient page.

In every case, sign-in works via the same `LoginForm` component and the
same `onSubmit(credentials, finish)` contract — wire your real
authentication call into `handleDemoSubmit` in `App.jsx`.
