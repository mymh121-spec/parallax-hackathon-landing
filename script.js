const chapters = [...document.querySelectorAll('.chapter, #studio')];
const links = [...document.querySelectorAll('.chapter-nav a')];
const hero = document.querySelector('.hero');
const layers = [...document.querySelectorAll('.chapter [data-parallax]')];
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let framePending = false;
let lastChapter;

const sheet = document.querySelector('.score-sheet');
const scoreSlider = document.querySelector('#score-step');
const scorePosition = document.querySelector('#score-position');
const markers = [...sheet.querySelectorAll('.score-mark')];
// Notehead centres in the artwork, measured on an 880 by 557 reference.
const scoreX = [195,243,290,338,406,454,501,549,616,664,712,759];
const originalY = [282,241,231,262,221,252,200,241,272,231,211,252];
const retrogradeY = [422,381,401,443,412,371,422,391,432,401,412,453];
let manualScrollY;
let shownStep;

function showScore(step) {
  if (shownStep === step) return;
  shownStep = step;
  const original = 12 - step;
  const reversed = step - 1;
  const description = '원형 ' + (original + 1) + '번째 ↔ 역행 ' + step + '번째';
  scorePosition.textContent = description;
  scoreSlider.value = step;
  scoreSlider.setAttribute('aria-valuetext', description);
  for (const [marker, index, y] of [[markers[0], original, originalY], [markers[1], reversed, retrogradeY]]) {
    marker.style.left = (scoreX[index] / 880 * 100) + '%';
    marker.style.top = (y[index] / 557 * 100) + '%';
  }
}
scoreSlider.addEventListener('input', () => {
  manualScrollY = window.scrollY;
  showScore(Number(scoreSlider.value));
});
showScore(1);
document.querySelector('.score-control').hidden = false;
sheet.classList.add('ready');

function updateScroll() {
  framePending = false;
  const viewport = window.innerHeight;
  let activeChapter;

  for (const chapter of chapters) {
    if (chapter.getBoundingClientRect().top <= viewport * 0.4) {
      activeChapter = chapter.id;
    }
  }

  if (window.scrollY > 0 && Math.ceil(window.scrollY + viewport) >= document.documentElement.scrollHeight) activeChapter = 'studio';
  links.forEach(link => {
    if (link.hash === '#' + activeChapter) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });

  if (activeChapter && lastChapter !== activeChapter) {
    const link = links.find(item => item.hash === '#' + activeChapter);
    const nav = link.parentElement;
    if (nav.scrollWidth > nav.clientWidth) {
      nav.scrollLeft = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2;
    }
  }
  lastChapter = activeChapter;
  if (!motionPreference.matches && (manualScrollY === undefined || Math.abs(window.scrollY - manualScrollY) > 24)) {
    manualScrollY = undefined;
    const bounds = sheet.getBoundingClientRect();
    const progress = (viewport * .78 - bounds.top) / Math.max(1, viewport * .53);
    showScore(1 + Math.round(Math.min(1, Math.max(0, progress)) * 11));
  }
  const heroImage = hero.querySelector('[data-parallax]');
  if (motionPreference.matches) {
    [heroImage, ...layers].forEach(layer => layer.style.removeProperty('transform'));
    return;
  }
  const heroBounds = hero.getBoundingClientRect();
  heroImage.style.transform = 'translateY(' + Math.max(0, -heroBounds.top * 0.10) + 'px)';
  layers.forEach(layer => {
    const bounds = layer.closest('.chapter').getBoundingClientRect();
    const offset = Math.max(-30, Math.min(30, (viewport / 2 - bounds.top - bounds.height / 2) * 0.055));
    layer.style.transform = 'translateY(' + offset + 'px)';
  });
}

function scheduleScrollUpdate() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(updateScroll);
}

window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
window.addEventListener('resize', scheduleScrollUpdate);
motionPreference.addEventListener('change', scheduleScrollUpdate);
updateScroll();
