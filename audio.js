const chapterAudio = document.querySelector('#chapter-audio');
const trackTemplate = document.querySelector('#track-template');
let activeTrack;

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
    frame.src = 'https://www.youtube-nocookie.com/embed/' + track.source.video + '?autoplay=1';
    frame.title = track.title + ' 장의 음악';
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
  const status = controls.querySelector('.track-status');
  const track = { play, status, video: controls.querySelector('.track-video'), title: chapter.querySelector('h2').textContent };
  const key = 'music-history:track:' + chapter.id;
  const defaultURL = chapterTracks[chapter.id] || '';
  input.value = defaultURL;
  try {
    input.value = localStorage.getItem(key) || defaultURL;
  } catch {}

  function applyURL(value) {
    track.source = value ? parseTrack(value) : undefined;
    play.disabled = !track.source;
  }

  try {
    applyURL(input.value);
  } catch {
    status.textContent = '음악 주소를 확인해 주세요.';
  }

  play.setAttribute('aria-pressed', 'false');
  play.addEventListener('click', () => startChapterTrack(track));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = input.value.trim();
    try {
      applyURL(value || defaultURL);
    } catch {
      status.textContent = '재생 가능한 음원이나 YouTube 동영상 주소를 넣어 주세요.';
      return;
    }
    if (activeTrack === track) stopChapterTrack();
    try {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
      status.textContent = value ? '이 브라우저에 음악 주소를 저장했어요.'
        : defaultURL ? '사이트 기본 음악으로 돌아왔어요.' : '음악 주소를 지웠어요.';
    } catch {
      status.textContent = '이번 방문에 음악 주소를 적용했어요.';
    }
    input.value = value || defaultURL;
    const settings = controls.querySelector('details');
    settings.open = false;
    settings.querySelector('summary').focus();
  });
  chapter.querySelector('.chapter-copy').append(controls);
}
