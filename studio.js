(() => {
  const waveNames = ['사인파', '삼각파', '사각파'];
  const waveTypes = ['sine', 'triangle', 'square'];
  // Original demonstration melody. Pairs contain a MIDI pitch and a duration in beats.
  const melody = [[60, 1], [64, 1], [67, 1], [69, 1], [67, 1], [64, 1], [62, 1], [60, 1]];
  const beat = 0.36;
  const knob = document.querySelector('#wave-knob');
  const canvas = document.querySelector('#waveform');
  const label = document.querySelector('#wave-label');
  const play = document.querySelector('#synth-play');
  const status = document.querySelector('#synth-status');
  const presets = [...document.querySelectorAll('[data-wave]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const cycle = waveNames.length;
  const wrap = value => ((value % cycle) + cycle) % cycle;
  const clamp = (number, min, max) => Math.max(min, Math.min(max, number));

  let position = 0;
  let velocity = 0;
  let target = 0;
  let lastFrame = 0;
  let frame = 0;
  let pointer;
  let audio;
  let transport;
  let request = 0;

  function waveBlend() {
    const phase = wrap(position);
    const first = Math.floor(phase);
    const next = (first + 1) % cycle;
    const mix = phase - first;
    const weights = waveNames.map((_, index) => {
      if (index === first) return 1 - mix;
      if (index === next) return mix;
      return 0;
    });
    return { phase, first, next, mix, weights };
  }

  function nearestPosition(preset) {
    return preset + Math.round((position - preset) / cycle) * cycle;
  }

  function drawWave(weights) {
    const context = canvas.getContext('2d');
    const { width, height } = canvas;
    context.clearRect(0, 0, width, height);
    context.strokeStyle = '#293640';
    context.beginPath();
    for (let line = 1; line < 8; line++) {
      context.moveTo(width * line / 8, 0);
      context.lineTo(width * line / 8, height);
    }
    for (let line = 1; line < 6; line++) {
      context.moveTo(0, height * line / 6);
      context.lineTo(width, height * line / 6);
    }
    context.stroke();
    context.strokeStyle = '#f1b87f';
    context.lineWidth = Math.max(1.6, width / 340);
    context.beginPath();
    for (let x = 0; x <= width; x++) {
      const phase = x / width * Math.PI * 6;
      const sine = Math.sin(phase);
      const triangle = Math.asin(sine) / (Math.PI / 2);
      const square = sine >= 0 ? 1 : -1;
      const sample = sine * weights[0] + triangle * weights[1] + square * weights[2];
      const y = height / 2 - sample * height * 0.32;
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }

  function render() {
    const { phase, first, next, mix, weights } = waveBlend();
    const exact = Math.abs(position - Math.round(position)) < 0.002;
    const active = wrap(Math.round(position));
    const name = exact ? waveNames[active] : waveNames[first] + ' ↔ ' + waveNames[next];
    knob.style.setProperty('--angle', (phase * 360 / cycle) + 'deg');
    knob.setAttribute('aria-valuenow', Math.round(phase / cycle * 100));
    knob.setAttribute('aria-valuetext', exact ? name : name + ' ' + Math.round(mix * 100) + '%');
    if (label.textContent !== name) label.textContent = name;
    for (const preset of presets) {
      preset.setAttribute('aria-pressed', String(exact && Number(preset.dataset.wave) === active));
    }
    drawWave(weights);
    if (transport) {
      transport.mix.forEach((gain, index) => {
        gain.gain.setTargetAtTime(weights[index], audio.currentTime, 0.018);
      });
    }
  }

  function settle(time) {
    // Integrate a damped spring. Small steps give the same response at different refresh rates.
    let remaining = Math.min((time - lastFrame) / 1000, 0.05);
    lastFrame = time;
    while (remaining > 0) {
      const step = Math.min(remaining, 1 / 120);
      const distance = target - position;
      velocity += (distance * 120 - velocity * 22) * step;
      const movement = velocity * step;
      if (distance !== 0 && distance * (distance - movement) <= 0) {
        position = target;
        velocity = 0;
        break;
      }
      position += movement;
      remaining -= step;
    }
    if (Math.abs(target - position) < 0.001 && Math.abs(velocity) < 0.012) {
      position = target;
      velocity = 0;
      frame = 0;
    } else {
      frame = requestAnimationFrame(settle);
    }
    render();
  }

  function moveTo(value, startVelocity = 0) {
    target = value;
    velocity = startVelocity;
    cancelAnimationFrame(frame);
    if (reducedMotion.matches) {
      position = target;
      velocity = 0;
      frame = 0;
      render();
      return;
    }
    lastFrame = performance.now();
    frame = requestAnimationFrame(settle);
  }

  function pointerAngle(event) {
    const bounds = knob.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    return Math.atan2(x, -y);
  }

  knob.addEventListener('pointerdown', event => {
    if (pointer || event.button !== 0) return;
    cancelAnimationFrame(frame);
    frame = 0;
    velocity = 0;
    knob.focus();
    knob.setPointerCapture(event.pointerId);
    pointer = { id: event.pointerId, angle: pointerAngle(event), time: event.timeStamp };
  });
  knob.addEventListener('pointermove', event => {
    if (pointer?.id !== event.pointerId) return;
    const angle = pointerAngle(event);
    const delta = Math.atan2(Math.sin(angle - pointer.angle), Math.cos(angle - pointer.angle));
    const next = position + delta * cycle / (Math.PI * 2);
    const elapsed = Math.max(0.008, (event.timeStamp - pointer.time) / 1000);
    velocity = clamp((next - position) / elapsed, -8, 8) * 0.65 + velocity * 0.35;
    position = next;
    pointer = { id: event.pointerId, angle, time: event.timeStamp };
    render();
  });

  function releaseKnob(event) {
    if (pointer?.id !== event.pointerId) return;
    const impulse = event.type !== 'pointerup' || event.timeStamp - pointer.time > 110 ? 0 : velocity;
    pointer = undefined;
    const projected = position + impulse * 0.10;
    moveTo(Math.round(projected), impulse);
  }
  knob.addEventListener('pointerup', releaseKnob);
  knob.addEventListener('pointercancel', releaseKnob);
  knob.addEventListener('lostpointercapture', releaseKnob);

  knob.addEventListener('keydown', event => {
    const keys = {
      ArrowRight: target + 0.15,
      ArrowUp: target + 0.15,
      ArrowLeft: target - 0.15,
      ArrowDown: target - 0.15,
      Home: nearestPosition(0),
      End: nearestPosition(cycle - 1),
      PageUp: target + 1,
      PageDown: target - 1,
    };
    if (!Object.hasOwn(keys, event.key)) return;
    event.preventDefault();
    moveTo(keys[event.key]);
  });
  for (const preset of presets) {
    preset.addEventListener('click', () => moveTo(nearestPosition(Number(preset.dataset.wave))));
  }
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && frame) moveTo(target);
  });

  function drawPianoRoll() {
    const editor = document.querySelector('.roll-editor');
    const pitchNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const lowestPitch = Math.floor(Math.min(...melody.map(([pitch]) => pitch)) / 12) * 12;
    const beats = melody.reduce((sum, [, duration]) => sum + duration, 0);
    const rowForPitch = pitch => 13 - (pitch - lowestPitch);
    const pitchLabel = pitch => pitchNames[pitch % 12] + (Math.floor(pitch / 12) - 1);

    editor.style.setProperty('--beats', beats);
    document.querySelector('.roll-tempo').textContent = Math.round(60 / beat) + ' BPM';
    for (let index = 0; index < beats; index++) {
      const mark = document.createElement('span');
      mark.className = 'roll-ruler';
      mark.style.gridColumn = index + 2;
      mark.textContent = (Math.floor(index / 4) + 1) + '.' + (index % 4 + 1);
      editor.append(mark);
    }
    for (let pitch = lowestPitch; pitch < lowestPitch + 12; pitch++) {
      const key = document.createElement('span');
      const lane = document.createElement('span');
      const accidental = pitchNames[pitch % 12].includes('♯') ? ' accidental' : '';
      key.className = 'roll-key' + accidental;
      lane.className = 'roll-lane' + accidental;
      key.style.gridRow = lane.style.gridRow = rowForPitch(pitch);
      if (!accidental) key.textContent = pitchLabel(pitch);
      editor.append(key, lane);
    }
    let column = 2;
    for (const [pitch, duration] of melody) {
      const note = document.createElement('span');
      note.className = 'roll-note';
      note.style.gridColumn = column + ' / span ' + duration;
      note.style.gridRow = rowForPitch(pitch);
      note.textContent = pitchLabel(pitch);
      editor.append(note);
      column += duration;
    }
  }

  function scheduleNotes() {
    if (!transport) return;
    if (transport.nextTime < audio.currentTime) transport.nextTime = audio.currentTime + 0.02;
    while (transport.nextTime < audio.currentTime + 0.15) {
      const [note, beats] = melody[transport.note];
      const start = transport.nextTime;
      const duration = beats * beat;
      const frequency = 440 * 2 ** ((note - 69) / 12);
      transport.oscillators.forEach(oscillator => oscillator.frequency.setValueAtTime(frequency, start));
      const gain = transport.envelope.gain;
      gain.setValueAtTime(0, start);
      gain.linearRampToValueAtTime(0.18, start + 0.018);
      gain.setValueAtTime(0.16, start + duration * 0.68);
      gain.linearRampToValueAtTime(0, start + duration * 0.95);
      transport.nextTime += duration;
      transport.note = (transport.note + 1) % melody.length;
    }
  }

  function stopMelody() {
    request++;
    if (!transport) return;
    clearInterval(transport.timer);
    const { envelope, oscillators } = transport;
    const now = audio.currentTime;
    if (typeof envelope.gain.cancelAndHoldAtTime === 'function') envelope.gain.cancelAndHoldAtTime(now);
    else envelope.gain.cancelScheduledValues(now);
    envelope.gain.setTargetAtTime(0, now, 0.012);
    oscillators.forEach(oscillator => oscillator.stop(now + 0.06));
    oscillators[0].addEventListener('ended', () => envelope.disconnect(), { once: true });
    transport = undefined;
    play.textContent = '멜로디 재생';
    play.setAttribute('aria-pressed', 'false');
  }

  async function toggleMelody() {
    if (transport) {
      stopMelody();
      return;
    }
    const attempt = ++request;
    status.textContent = '';
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audio ??= new AudioContext();
      await audio.resume();
    } catch {
      if (attempt === request) status.textContent = '이 브라우저에서 합성음을 재생할 수 없어요.';
      return;
    }
    if (attempt !== request) return;
    document.dispatchEvent(new Event('studio-audio-start'));
    const envelope = audio.createGain();
    envelope.gain.value = 0;
    envelope.connect(audio.destination);
    const { weights } = waveBlend();
    const mix = waveTypes.map((type, index) => {
      const gain = audio.createGain();
      gain.gain.value = weights[index];
      gain.connect(envelope);
      return gain;
    });
    const oscillators = waveTypes.map((type, index) => {
      const oscillator = audio.createOscillator();
      oscillator.type = type;
      oscillator.connect(mix[index]);
      oscillator.start();
      return oscillator;
    });
    transport = { envelope, mix, oscillators, note: 0, nextTime: audio.currentTime + 0.035 };
    scheduleNotes();
    transport.timer = setInterval(scheduleNotes, 30);
    play.textContent = '멜로디 멈추기';
    play.setAttribute('aria-pressed', 'true');
  }

  drawPianoRoll();
  play.addEventListener('click', toggleMelody);
  document.addEventListener('chapter-audio-start', stopMelody);
  new ResizeObserver(() => {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * scale);
    canvas.height = Math.round(canvas.clientHeight * scale);
    render();
  }).observe(canvas);
  render();
})();
