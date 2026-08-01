import STORY_DATA from './data/story-data.js';
import { renderStory } from './components/chapter-renderer.js';
import { initLightbox } from './components/lightbox.js';
import { runLoadingSequence } from './engines/loading.js';
import { initParticles } from './engines/particles.js';
import { initSmoothScroll } from './engines/smooth-scroll.js';
import { initChapterObserver } from './engines/chapter-observer.js';
import { initTextReveal } from './engines/text-reveal.js';
import { initClimaxScenes } from './engines/climax-scene.js';
import { initSoundToggle } from './engines/sound-engine.js';
import { initCursor } from './engines/cursor.js';
import { initDaysCounter } from './engines/days-counter.js';
import { initPhotoGallery } from './components/photo-gallery.js';
import { initMessageWidget } from './components/message-widget.js';
import { initWorldLove } from './components/world-love.js';
import { initLoveNote } from './components/love-note.js';

function boot() {
  const mount = document.getElementById('story-root');

  // Guard: if boot() somehow runs twice (hot-reload tools, a preview
  // iframe re-injecting the script, a double <script> tag, etc.), never
  // render the story a second time into the same mount point -- that's
  // what causes chapters to visibly duplicate on screen.
  if (mount.dataset.rendered === 'true') return;
  mount.dataset.rendered = 'true';

  renderStory(STORY_DATA, mount);

  initLightbox();
  const particles = initParticles();
  const sound = initSoundToggle();
  initSmoothScroll();
  initChapterObserver({
    setEmotion: (key) => {
      particles.setEmotion(key);
      sound.setEmotion(key);
    },
  });
  initTextReveal(mount);
  initClimaxScenes();
  initCursor();
  initDaysCounter();
  initPhotoGallery(STORY_DATA);
  initMessageWidget();
  initWorldLove();
  initLoveNote();
}

// Guard at the module level too: if this whole script somehow executes
// twice (two <script type="module"> tags pointing at it, a preview tool
// re-injecting it without a full page reload), only the first execution
// is allowed to start the loading sequence at all.
if (!window.__hamariKahaniBooted) {
  window.__hamariKahaniBooted = true;
  runLoadingSequence({ onDone: boot });
}
