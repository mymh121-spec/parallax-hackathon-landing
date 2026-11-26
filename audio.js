const chapterAudio = document.querySelector('#chapter-audio');
const trackTemplate = document.querySelector('#track-template');
const creditsList = document.querySelector('#audio-credits-list');
const editingTrackURLs = new URLSearchParams(location.search).get('music') === 'edit';
let activeTrack;

const demoCues = {
  renaissance: '높은 성부가 시작하고 두 박 뒤에 낮은 성부가 같은 선율을 따라옵니다.',
  baroque: '혼자 들려주던 첫 선율을 다시 들을 때, 이번에는 베이스와 화음이 함께 들어옵니다.',
  classicism: '비슷하게 시작하는 두 악구의 끝을 비교해 보세요. 두 번째 악구가 첫 음으로 돌아옵니다.',
  romanticism: '하나, 둘, 셋을 세어 보세요. 둘째 박의 화음을 세게 친 세 박자 춤입니다.',
  modernism: '잠깐의 쉼을 사이에 두고 악보의 첫 줄과 둘째 줄이 차례로 들립니다.',
  digital: '피아노 롤의 여덟 음이 두 번 나옵니다. 두 번째에는 같은 음에 배음을 더했습니다.',
};

function parseTrack(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
  const host = url.hostname.toLowerCase().replace(/^(www\.|m\.)/, '');
  if (host === 'youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') {
    const parts = url.pathname.split('/').filter(Boolean);
    const id = host === 'youtu.be' ? parts[0]
      : url.searchParams.get('v') || (['embed', 'shorts', 'live'].includes(parts[0]) ? parts[1] : '');
    if (!/^[\w-]{11}$/.test(id || '')) throw new Error();
    return { video: id };
  }
  return { url: url.href };
}

function stopChapterTrack() {
  if (!activeTrack) return;
  activeTrack.play.textContent = '이 장의 곡 듣기';
  activeTrack.play.setAttribute('aria-pressed', 'false');
  activeTrack.video.replaceChildren();
  activeTrack = undefined;
  chapterAudio.pause();
  chapterAudio.removeAttribute('src');
  chapterAudio.load();
}

async function startChapterTrack(track) {
  if (activeTrack === track) {
    stopChapterTrack();
    return;
  }
  stopChapterTrack();
  document.dispatchEvent(new Event('chapter-audio-start'));
  activeTrack = track;
  track.status.textContent = '';
  track.play.textContent = '재생 멈추기';
  track.play.setAttribute('aria-pressed', 'true');

  if (track.source.video) {
    const frame = document.createElement('iframe');
    const params = new URLSearchParams({ autoplay: '1', playsinline: '1' });
    if (track.startSeconds) params.set('start', String(track.startSeconds));
    frame.src = 'https://www.youtube-nocookie.com/embed/' + track.source.video + '?' + params;
    frame.title = '음악 재생 — ' + track.title;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.allowFullscreen = true;
    track.video.append(frame);
    return;
  }
  chapterAudio.src = track.source.url;
  try {
    await chapterAudio.play();
  } catch {
    if (activeTrack === track) reportAudioError();
  }
}

function reportAudioError() {
  if (!activeTrack) return;
  activeTrack.needsCorrection = true;
  activeTrack.status.textContent = '음원을 재생할 수 없어요. 브라우저에서 직접 재생되는 주소인지 확인해 주세요.';
  stopChapterTrack();
}

chapterAudio.addEventListener('ended', stopChapterTrack);
chapterAudio.addEventListener('error', reportAudioError);
document.addEventListener('studio-audio-start', stopChapterTrack);

for (const chapter of document.querySelectorAll('.chapter')) {
  const controls = trackTemplate.content.firstElementChild.cloneNode(true);
  const play = controls.querySelector('.track-play');
  const form = controls.querySelector('form');
  const input = form.elements.url;
  const field = input.closest('label');
  const status = controls.querySelector('.track-status');
  const title = controls.querySelector('.track-title');
  const cue = controls.querySelector('.track-cue');
  const track = { play, status, video: controls.querySelector('.track-video') };
  const key = 'music-history:track:' + chapter.id;
  const selection = chapterTracks[chapter.id];
  const defaultURL = selection?.url ?? selection ?? '';
  const chapterTitle = chapter.querySelector('h2').textContent;
  if (selection?.credit) {
    const entry = document.createElement('li');
    const era = document.createElement('strong');
    era.textContent = chapterTitle;
    const source = document.createElement('a');
    source.textContent = selection.credit;
    source.href = selection.source;
    entry.append(era, source);

    if (selection.license) {
      const license = document.createElement('a');
      [license.textContent, license.href] = selection.license;
      entry.append(' / ', license);
    }
    if (selection.creditNote) entry.append(' / ' + selection.creditNote);
    creditsList.append(entry);
  }
  let currentURL = defaultURL;
  try {
    currentURL = localStorage.getItem(key) || defaultURL;
  } catch {}

  function applyURL(value) {
    const showSelection = Boolean(selection?.title && value === defaultURL);
    const localURL = showSelection && value.startsWith('assets/') ? value : '';
    track.source = localURL || !value
      ? { url: localURL || 'assets/audio/' + chapter.id + '.wav' }
      : parseTrack(value);
    track.startSeconds = showSelection ? selection.startSeconds : undefined;
    track.title = showSelection ? selection.title : chapterTitle;
    title.hidden = !showSelection;
    title.textContent = showSelection ? selection.title : '';
    cue.textContent = showSelection ? selection.cue : value ? '' : '직접 만든 예시 음원　' + demoCues[chapter.id];
    cue.hidden = !cue.textContent;
    track.needsCorrection = false;
    currentURL = value;
  }

  function closeEditor() {
    field.hidden = true;
    play.textContent = '이 장의 곡 듣기';
    play.setAttribute('aria-pressed', 'false');
    play.focus();
  }

  try {
    applyURL(currentURL);
  } catch {
    status.textContent = '음악 주소를 확인해 주세요.';
  }

  play.setAttribute('aria-pressed', 'false');
  form.addEventListener('submit', event => {
    event.preventDefault();

    if (field.hidden) {
      if (track.source && !editingTrackURLs && !track.needsCorrection) {
        startChapterTrack(track);
      } else {
        field.hidden = false;
        input.value = currentURL.startsWith('assets/') ? '' : currentURL;
        play.textContent = editingTrackURLs ? '주소 저장' : '저장하고 듣기';
        input.focus();
      }
      return;
    }

    const value = input.value.trim();
    try {
      applyURL(value || defaultURL);
    } catch {
      status.textContent = '재생 가능한 음원이나 YouTube 동영상 주소를 넣어 주세요.';
      input.focus();
      return;
    }
    try {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
      status.textContent = value ? '이 브라우저에 음악 주소를 저장했어요.'
        : defaultURL ? '사이트 기본 음악으로 돌아왔어요.' : '예시 음원으로 돌아왔어요.';
    } catch {
      status.textContent = '이번 방문에 음악 주소를 적용했어요.';
    }
    closeEditor();
    if (track.source && !editingTrackURLs) startChapterTrack(track);
  });

  form.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !field.hidden) {
      event.preventDefault();
      closeEditor();
    }
  });

  chapter.querySelector('.chapter-copy').append(controls);
}
