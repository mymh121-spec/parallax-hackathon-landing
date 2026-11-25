function addMark(diagram, className, variables, label) {
  const mark = document.createElement('span');
  mark.className = className;
  for (const [key, value] of Object.entries(variables)) {
    mark.style.setProperty('--' + key, value + '%');
  }
  if (label !== undefined) mark.textContent = label;
  diagram.append(mark);
}

function addStaff(diagram, start) {
  for (let line = 0; line < 5; line++) {
    addMark(diagram, 'staff-line', { y: start + line * 5 });
  }
}

const diagrams = {
  voices(diagram) {
    for (let voice = 0; voice < 3; voice++) {
      const baseline = 16 + voice * 29;
      addStaff(diagram, baseline);
      [3, 2, 0, 1, 2].forEach((step, index) => {
        addMark(diagram, 'note', {
          x: 5 + voice * 13 + index * 13,
          y: baseline + step * 5,
        });
      });
    }
  },
  contrast(diagram) {
    addStaff(diagram, 22);
    addStaff(diagram, 65);
    const passages = [
      { x: 2, y: 25, width: 25, height: 7 },
      { x: 32, y: 18, width: 26, height: 26 },
      { x: 63, y: 27, width: 13, height: 7 },
      { x: 81, y: 16, width: 17, height: 30 },
      { x: 2, y: 75, width: 96, height: 3 },
    ];
    passages.forEach(passage => addMark(diagram, 'bar', passage));
  },
  phrases(diagram) {
    addStaff(diagram, 40);
    [50, 44, 42, 45, 50, 44, 46, 56].forEach((y, index) => {
      const x = 5 + index * 12 + (index >= 4 ? 5 : 0);
      addMark(diagram, 'note', { x, y });
    });
  },
  row(diagram) {
    const row = [0, 4, 1, 7, 3, 10, 8, 2, 11, 6, 9, 5];
    [row, row.slice().reverse()].forEach((sequence, index) => {
      sequence.forEach((note, column) => {
        addMark(diagram, 'cell', { x: column * 8.35, y: 27 + index * 28 }, note);
      });
    });
  },
  roll(diagram) {
    for (let line = 0; line < 11; line++) {
      addMark(diagram, 'staff-line', { y: line * 10 });
    }
    [
      { x: 4, y: 62, width: 16 }, { x: 20, y: 42, width: 14 },
      { x: 34, y: 32, width: 26 }, { x: 60, y: 12, width: 12 },
      { x: 72, y: 22, width: 24 }, { x: 4, y: 82, width: 30, opacity: 45 },
      { x: 34, y: 72, width: 38, opacity: 45 },
      { x: 72, y: 82, width: 24, opacity: 45 },
    ].forEach(note => addMark(diagram, 'bar', note));
  },
};

document.querySelectorAll('[data-diagram]').forEach(diagram => {
  diagrams[diagram.dataset.diagram](diagram);
});

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
