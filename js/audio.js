/* ═══ ГОССЕТЬ-84 // ЗВУКОВОЙ ДВИЖОК ═══
   Чистый синтез: звуки интерфейса + четырёхдорожечный чиптюн-эфир. */
"use strict";

const GS_AUDIO = (() => {
  let ctx = null, master = null, sfxBus = null, musBus = null, analyser = null;
  let noiseBuf = null;
  let vol = 0.7, sfxOn = true;
  let playing = false, trackIdx = 0, step = 0, nextTime = 0, timer = null;

  const m = n => 440 * Math.pow(2, (n - 69) / 12); // midi → Гц

  /* аккорды: midi-ноты лада (терция/квинта считаются индексами) */
  const CH = {
    Am:  [45, 48, 52], F:  [41, 45, 48], C:  [48, 52, 55], G:  [43, 47, 50],
    Dm:  [50, 53, 57], Bb: [46, 50, 53], Cm: [48, 51, 55], Ab: [44, 48, 51],
    Eb:  [51, 55, 58], Em: [52, 55, 59], D:  [50, 54, 57]
  };

  // -1 = пауза; индексы 0,1,2 = тоны аккорда; 3 = октава баса
  const TRACKS = [
    {
      title: "НЕОНОВЫЙ ДОЖДЬ", composer: "АНСАМБЛЬ «СТАТИКА»", bpm: 112,
      chords: ["Am", "F", "C", "G"],
      lead:  [3,0,1,2, 2,1,0,1, 3,0,1,2, 2,1,3,-1,
              3,0,1,2, 2,1,0,1, 3,2,1,0, -1,-1,-1,-1,
              3,0,1,2, 2,1,0,1, 0,1,2,3, 3,2,1,0,
              2,-1,1,-1, 0,-1,2,-1, 3,-1,-1,-1, 3,-1,-1,-1],
      bass:  [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0]
    },
    {
      title: "КРАСНАЯ ЗВЕЗДА", composer: "СИНТ-ОРКЕСТР ГКР", bpm: 100,
      chords: ["Dm", "Bb", "F", "C"],
      lead:  [0,1,2,3, -1,3,2,1, 0,-1,1,-1, 2,-1,-1,-1,
              0,1,2,3, -1,3,2,1, 3,-1,2,-1, 1,-1,-1,-1,
              3,3,2,2, 1,1,0,0, 1,-1,2,-1, 3,-1,-1,-1,
              0,-1,0,1, 2,-1,2,1, 0,-1,-1,-1, 3,-1,-1,-1],
      bass:  [1,0,1,0, 0,1,0,0, 1,0,1,0, 0,0,1,0]
    },
    {
      title: "СТАЛЬНОЙ РАССВЕТ", composer: "КВАРТЕТ РЕГИСТРОВ", bpm: 126,
      chords: ["Cm", "Ab", "Eb", "Bb"],
      lead:  [3,2,1,0, 1,2,3,2, 3,2,1,0, -1,0,1,2,
              3,2,1,0, 1,2,3,2, 3,-1,3,-1, -1,-1,-1,-1,
              2,2,3,3, 2,1,0,1, 2,-1,1,-1, 0,-1,1,-1,
              3,2,1,0, 3,2,1,0, 3,-1,-1,-1, 3,-1,-1,-1],
      bass:  [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,1,0,0]
    },
    {
      title: "ПОЛЁТ ЧАЙКИ-84", composer: "ДУЭТ «ВЕТЕР И ПРОВОД»", bpm: 96,
      chords: ["Em", "C", "G", "D"],
      lead:  [3,-1,2,-1, 1,-1,0,-1, 1,2,3,-1, -1,-1,-1,-1,
              3,-1,2,-1, 1,-1,2,-1, 3,-1,3,-1, 2,-1,1,-1,
              0,1,2,-1, 0,1,2,3, -1,3,2,1, 0,-1,-1,-1,
              3,-1,-1,2, -1,-1,1,-1, 0,-1,-1,-1, -1,-1,-1,-1],
      bass:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,1,0]
    }
  ];

  function ensure() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return true; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return false; }
    master = ctx.createGain(); master.gain.value = vol; master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.5; sfxBus.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = 0.6;
    analyser = ctx.createAnalyser(); analyser.fftSize = 128;
    musBus.connect(analyser); analyser.connect(master);
    const len = ctx.sampleRate * 0.4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    noiseBuf = buf;
    return true;
  }

  /* ── звуки интерфейса ── */
  function blip(freq, dur, type, gain, when, slideTo) {
    if (!ctx) return;
    const t = when || ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "square"; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function sfx(kind) {
    if (!sfxOn || !ensure()) return;
    switch (kind) {
      case "hover": blip(1250, 0.035, "square", 0.025); break;
      case "click": blip(620, 0.06, "square", 0.06); blip(930, 0.05, "square", 0.04, ctx.currentTime + 0.045); break;
      case "open":  blip(440, 0.09, "square", 0.05); blip(880, 0.12, "square", 0.05, ctx.currentTime + 0.07); break;
      case "back":  blip(880, 0.07, "square", 0.05); blip(440, 0.1, "square", 0.04, ctx.currentTime + 0.06); break;
      case "coin":  blip(990, 0.07, "square", 0.07); blip(1320, 0.16, "square", 0.07, ctx.currentTime + 0.07); break;
      case "error": blip(160, 0.16, "sawtooth", 0.07); blip(110, 0.2, "sawtooth", 0.06, ctx.currentTime + 0.1); break;
      case "key":   blip(2000 + Math.random() * 600, 0.02, "square", 0.02); break;
      case "eat":   blip(500, 0.05, "square", 0.06); blip(760, 0.07, "square", 0.06, ctx.currentTime + 0.04); break;
      case "die":   blip(400, 0.5, "sawtooth", 0.08, ctx.currentTime, 60); break;
      case "turbo": for (let i = 0; i < 6; i++) blip(440 * Math.pow(2, i / 3), 0.09, "square", 0.05, ctx.currentTime + i * 0.06); break;
      case "boot":  blip(220, 0.4, "sine", 0.08); blip(440, 0.3, "square", 0.03, ctx.currentTime + 0.15); break;
    }
  }

  /* ── чиптюн-эфир ── */
  function tone(freq, t, dur, type, gain, dest, cutoff) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    let node = o;
    if (cutoff) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = cutoff; o.connect(f); node = f; }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(g); g.connect(dest || musBus);
    o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(t, dur, gain, hp) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = hp ? "highpass" : "bandpass";
    f.frequency.value = hp ? 6500 : 1800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(musBus);
    s.start(t); s.stop(t + dur + 0.02);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.11);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(musBus);
    o.start(t); o.stop(t + 0.2);
  }

  function schedStep(s, t) {
    const tr = TRACKS[trackIdx];
    const bar = Math.floor(s / 16) % 4;
    const st = s % 16;
    const chord = CH[tr.chords[bar]];
    const sd = 60 / tr.bpm / 4;

    if (st % 4 === 0) kick(t);                                    // бочка
    if (st % 8 === 4) noise(t, 0.12, 0.16, false);                // рабочий
    if (st % 2 === 1) noise(t, 0.045, 0.05, true);                // хэт
    if (tr.bass[st]) tone(m(chord[0] - 12), t, sd * 1.8, "sawtooth", 0.16, musBus, 700); // бас
    if (st === 0) {                                               // пэд на такт
      const p1 = m(chord[0]), p2 = m(chord[2]);
      tone(p1, t, sd * 15, "triangle", 0.05, musBus);
      tone(p2, t, sd * 15, "triangle", 0.04, musBus);
    }
    const li = tr.lead[s % 64];
    if (li >= 0) {                                                // соло
      const note = li >= 3 ? chord[0] + 12 : chord[li];
      tone(m(note + 12), t, sd * 0.95, "square", 0.07, musBus);
      tone(m(note + 12) * 1.006, t, sd * 0.7, "square", 0.04, musBus);
    }
  }

  function loop() {
    if (!playing) return;
    const tr = TRACKS[trackIdx], sd = 60 / tr.bpm / 4;
    while (nextTime < ctx.currentTime + 0.14) {
      schedStep(step, nextTime);
      step = (step + 1) % 64;
      nextTime += sd;
    }
    timer = setTimeout(loop, 30);
  }

  function play(idx) {
    if (!ensure()) return false;
    if (typeof idx === "number") { trackIdx = (idx + TRACKS.length) % TRACKS.length; }
    stopSched();
    playing = true; step = 0; nextTime = ctx.currentTime + 0.08;
    loop();
    sfx("open");
    updateViews();
    return true;
  }
  function stopSched() { playing = false; clearTimeout(timer); }
  function pause() { stopSched(); updateViews(); }
  function next() { play(trackIdx + 1); }
  function prev() { play(trackIdx - 1); }

  let viewUpdaters = [];
  function onUpdate(fn) { viewUpdaters.push(fn); }
  function updateViews() { viewUpdaters.forEach(fn => fn()); }

  return {
    ensure, sfx, play, pause, next, prev, analyser: () => analyser,
    isPlaying: () => playing,
    track: () => TRACKS[trackIdx],
    trackIdx: () => trackIdx,
    tracks: TRACKS,
    progress: () => step / 64,
    onUpdate,
    setVolume(v) { vol = v; if (master) master.gain.value = v; },
    getVolume: () => vol,
    setSfx(on) { sfxOn = on; },
    getSfx: () => sfxOn,
    ctx: () => ctx
  };
})();
