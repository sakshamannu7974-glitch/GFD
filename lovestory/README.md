# Hamari Kahani — Our Story

A cinematic, scroll-driven memory site built from your story and both uploaded ZIPs.

## How to run it

This is a static site — no build step, no npm install required.

```bash
cd lovestory
python3 -m http.server 8000
# open http://localhost:8000
```

(Or just open `index.html` directly in a browser — everything is a plain `<script type="module">`.) It needs an internet connection on first load, because GSAP, ScrollTrigger, and Lenis load from cdnjs — see "Known limitations" below for what happens if they fail.

---

## What's actually built (v1 — honest status)

- **All 21 sections** (hero, 17 chapters, the long-distance interlude, the Contract reveal, the closing) are real, rendered, data-driven HTML — not a mockup.
- **All 224 unique media files** from both ZIPs (199 photos + 25 videos, after removing 2 exact duplicates) are wired into `js/data/story-data.js` with a verified, real file path — I ran a script that checks every single reference against the actual files on disk; zero are missing or broken links.
- **Every asset placement has a stated reason** — see the mapping table below. Nothing was scattered randomly.
- **Loading sequence**: dark screen → heartbeat pulse → three fading sentences → reveal (skips instantly for `prefers-reduced-motion`).
- **Smooth scroll** via Lenis, synced to GSAP's ticker so ScrollTrigger doesn't drift out of alignment with it.
- **Scroll-triggered reveals**: chapter headers rise into view, photo grids stagger in, videos fade in — with a working fallback (plain IntersectionObserver, no GSAP dependency) if the CDN fails to load.
- **Emotion-driven palette**: each chapter declares an emotion (friendship / hope / love / firstMeeting / travel / temple / joy / sad / future) from the color-psychology table in your brief; the background accent and the particle field's color both cross-fade as you scroll between chapters.
- **Canvas particle system** (not Three.js — see note below) whose density, speed, and color respond to the active chapter's emotion.
- **Videos never autoplay off-screen**: `preload="none"`, a real poster frame (extracted via ffmpeg from each video, without touching your original files), and an IntersectionObserver that assigns the real `src` and plays only once a video is actually in view, pausing the moment it leaves.
- **Word-by-word text reveal** (`js/engines/text-reveal.js`): every story paragraph splits into words that blur/fade in as you scroll past it ("memories returning," per your brief) — pure DOM splitting, no paid GSAP plugin, and the full sentence is exposed via `aria-label` so screen readers get the real text, not word fragments.
- **A real Three.js moment, used exactly once** (`js/engines/climax-scene.js`): Chapter 9 — the first meeting — has a soft particle field that gathers from a scattered sphere into a heart shape behind the text as you scroll into it. Three.js (~600KB) is lazy-loaded from CDN only when this chapter is about to enter view, and never loads at all for `prefers-reduced-motion` visitors. This was the one open decision from the previous README — I made the call rather than leaving it unbuilt, since your brief specifically named the first meeting as the place a meaningful 3D moment would earn its cost.
- **Sound-ready infrastructure** (`js/engines/sound-engine.js`): a real, working toggle button wired to the Web Audio API — gain node, autoplay-policy-safe (only starts audio after a user gesture, per every browser's audio policy), per-emotion track switching already implemented. **Honest limitation: there is no actual audio.** Neither ZIP contained any, and I have no way to generate music. The toggle is visible but disabled until you supply files — see the `EMOTION_TRACKS` map at the top of that file; adding real paths there is the only step left.
- **The Contract**: a click-to-open envelope interaction, not just a static image dump.
- **Accessibility**: skip link, `aria-live` on the story root, full `prefers-reduced-motion` support (disables the particle field, climax scene, loading animation, text-reveal, and all GSAP reveals; content is simply visible), keyboard-dismissible lightbox (Escape key).
- **Duplicate detection**: 2 exact-duplicate files (confirmed byte-for-byte identical, not just similar) were silently excluded.
- **Code hardening**: `chapter-renderer.js` now uses `textContent` for every plain-text node (your story text, titles, dates) and reserves `innerHTML` only for the 3 spots that need real markup (an icon glyph, two nested-span layouts) — closes a code-quality gap where story text was previously inserted via `innerHTML` and would have broken if it ever contained `<`, `>`, or `&`.
- **Custom cursor** (`js/engines/cursor.js`): a soft glow dot that trails the pointer and grows/warms with the active emotion's accent color when hovering any photo, video, or button — the "cursor becomes part of the experience" note from Part 6. Disabled entirely on touch devices and under reduced motion (there's no pointer to follow on touch, and a growing/trailing cursor is exactly the kind of motion reduced-motion visitors are opting out of).
- **Animated day counter** (`js/engines/days-counter.js`): the closing section now shows a real, live-computed day count since 11 April 2025 (the date you gave — when the proposal was accepted), counting up on scroll-into-view. Not a fixed number that goes stale — it's computed against the visitor's actual current date every time the page loads.
- **Evolving background glow**: a radial gradient layer behind the particle field now cross-fades color with the active chapter's emotion, using `@property` to register the color custom properties for smooth interpolation in browsers that support it (Chromium-based; degrades to an instant color change elsewhere — never broken, just less smooth on older engines).
- **Media error resilience**: every image and video now has an `onerror` handler that hides itself gracefully instead of showing a broken-image icon, per Part 9's "never assume media always exists, handle broken images/videos, no crashes."
- **SEO/social meta**: Open Graph + Twitter Card tags, using the hero collage as the preview image, plus a proper favicon (a simple heart mark in the site's rose-gold accent).
- **Privacy call I made unilaterally, flagging it explicitly**: I added `<meta name="robots" content="noindex, nofollow">`. This is real photos of real, identifiable people. I chose not to make this crawlable/indexable by default rather than optimize it for search visibility — if you actually want this discoverable (e.g. shared publicly), remove that one tag; I'd rather you have to opt in to indexing than have me opt you in without asking.

## What I did NOT build yet (do not take this as "done")

- **No custom typography/color grading beyond the token system** — fonts (Fraunces/Inter/Caveat) are loaded from Google Fonts; I haven't done a final kerning/rhythm pass by eye, because I cannot render a browser in this sandbox (see below).
- **The date-based sequencing inside chapters 9–13 and 15 is approximate**, not verified frame-by-frame. I matched folders to chapters using embedded filename timestamps (confirmed accurate for splitting the two gifts, for example — 11 March 2025 vs Feb–March 2026, exactly matching your story). But *within* a chapter — e.g. exactly which of the 48 "Saath mai ghumna" photos is from day 1 vs day 2 of the three-day trip — I distributed them in file order, not verified chronological order, because I don't have reliable per-photo confirmation of that. Worth a pass together if exact in-chapter sequencing matters to you.
- **Payload size is large and I have not solved it.** `assets/` is 625MB, because your instruction was explicit — never compress or degrade quality — and I followed that literally. For local viewing this is fine. For actually hosting this on the internet, 625MB will load slowly on mobile data even with lazy loading, because lazy-loaded is not the same as small. Before deploying, I'd recommend either: (a) a video/image CDN that serves adaptive quality without touching your master files (Cloudflare Stream, Cloudinary, etc.), or (b) accepting slower first loads as a tradeoff for full quality. I did not make this call unilaterally — flagging it for your decision.
- **I have not tested this in an actual browser.** My sandbox has no network access, so I could not load the CDN scripts or visually confirm the animations render as intended. I verified: every JS file is syntactically valid (`node --check`), every CSS file has balanced braces, the HTML parses cleanly, and every one of the 224 media references resolves to a real file on disk. I did not verify runtime behavior, animation timing feel, or visual polish, because I cannot render a browser here. That needs a real check on your end (or a session where I can browser-test) before calling this launch-ready.

## Chapter → media mapping (for your reference)

| Section | Source folder(s) | Files | Reasoning |
|---|---|---|---|
| Hero | root `sk` | 2 collages | Pre-made relationship-summary pieces |
| Ch.2 — First Gift | `gift jo us ne beje` | 9 (dated 11 Mar 2025 only) | Filename dates match story exactly |
| Ch.7 — Second Gift | `gift jo us ne beje` | 7 (dated Feb–Mar 2026) | Same folder, correctly date-split |
| Interlude — Miles Apart | `video call` | 33 photos + 2 videos | Spans Jan–June 2026, matching sustained long distance |
| Ch.8 — Arrival | root `sk` | 3 station photos + 1 webp | Bhopal/Delhi stations, Connaught Place |
| Ch.9 — First Meeting | `Saath mai ghumna` (first 16) | 16 | Trip photos, no way to isolate the exact metro-station shot without your confirmation |
| Ch.10 — Holding Hands | `Saath mai ghumna` (next 8) | 8 | — |
| Ch.11 — Three Days | `Saath mai ghumna` (remaining 24) + `night mast` + 8 trip videos | 41 | — |
| Ch.15 — Temple & Park | `delhi Mandir` + `park` | 6 + 41 + 14 videos + 1 highlight | Dates (28–29 Mar 2026) match the second-visit story beat |
| Ch.17 / Coda | `us ki photos` | 39 (2 duplicates removed) | Spans the full relationship, used as recurring/closing portraits |
| Contract | root `sk` | `Our Contract.jpg` | Not mentioned in your story text, but clearly a real artifact — given its own reveal moment |

**Chapters 3, 4, 5, 6, and 14 (relationship start, the silence, the message, the restart, Mathura/Vrindavan/Govardhan) intentionally have zero photos** — none exist in either ZIP for those beats, and I'm not going to invent stock imagery to fill the gap. They're text-only, which is honest, not incomplete.

## Project structure

```
lovestory/
  index.html
  css/
    tokens.css        Color-psychology palette per emotion + type/motion scale
    base.css           Reset, typography, global layers
    loading.css        Loading sequence
    components.css     Hero, chapters, galleries, lightbox, letter, closing
    responsive.css      Breakpoints + accessibility overrides
  js/
    main.js             Orchestrator
    data/story-data.js   All 21 sections' text + real asset paths (auto-generated, see below)
    components/
      chapter-renderer.js   Data -> DOM
      lightbox.js
    engines/
      loading.js            Loading sequence logic
      particles.js           Canvas particle field
      smooth-scroll.js       Lenis + ScrollTrigger sync
      chapter-observer.js    Scroll reveals, emotion cross-fade, video play-on-view
      text-reveal.js         Word-by-word paragraph reveal
      climax-scene.js        Lazy-loaded Three.js heart-constellation (Ch.9 only)
      sound-engine.js        Web Audio toggle infrastructure (no audio files yet)
      cursor.js               Custom trailing/glowing cursor
      days-counter.js         Live-computed "days together" counter
  assets/
    images/<chapter-folder>/...
    videos/<chapter-folder>/...
    posters/                 ffmpeg-extracted still frames for every video
```

`story-data.js` was generated by a Python script (not committed here, but reconstructable) that reads the real copied file paths and combines them with the chapter text — this is why every path is guaranteed to be correct rather than hand-typed.

## Next steps, if you want to keep going

1. Confirm or correct the approximate in-chapter photo ordering (Ch.9–13, Ch.15).
2. Supply real ambient audio files if you want the sound toggle to actually play something — drop paths into `EMOTION_TRACKS` in `js/engines/sound-engine.js`.
3. Decide on the media hosting/compression question above before this goes live anywhere public.
4. Decide whether the `noindex` privacy tag in `index.html` should stay (default) or be removed (if you want this shareable/discoverable publicly).
5. **The one thing I genuinely cannot finish from here: a real browser QA pass.** Every file has been verified as far as static analysis can go — every JS file is syntax-valid, every CSS file has balanced braces, every one of the 224 media references resolves to a real file on disk, the HTML parses cleanly, and every engine is correctly wired into `main.js`. What I have *not* done, because I have no network access in this sandbox, is actually load this in a browser and watch it move — confirm the GSAP timing feels right, that the Three.js constellation looks good rather than just technically working, that nothing overlaps oddly on a real phone screen. That gap is real, and I'm not going to paper over it by calling this "100% production-tested." It's fully built and internally consistent; the remaining step is eyes-on, in an actual browser, which has to happen on your end or in a session where I have that access.
