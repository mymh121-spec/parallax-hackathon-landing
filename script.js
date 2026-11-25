const chapters = [...document.querySelectorAll('.chapter')];
const links = [...document.querySelectorAll('.chapter-nav a')];
const hero = document.querySelector('.hero');
const layers = [...document.querySelectorAll('.chapter [data-parallax]')];
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let framePending = false;

function updateScroll() {
  framePending = false;
  const viewport = window.innerHeight;
  let activeChapter;

  for (const chapter of chapters) {
    if (chapter.getBoundingClientRect().top <= viewport * 0.4) {
      activeChapter = chapter.id;
    }
  }

  links.forEach(link => {
    if (link.hash === '#' + activeChapter) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });

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
