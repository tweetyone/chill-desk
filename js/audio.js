// ============================================================
// AUDIO — ambient music (SoundCloud) + ambient sounds
// ============================================================

let audC = null;
function getAC() {
  if (!audC) {
    try { audC = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { console.warn('AudioContext unavailable:', e); return null; }
  }
  return audC;
}

// Release audio resources on page unload
window.addEventListener('beforeunload', () => { if (audC) { try { audC.close(); } catch (e) { /* noop */ } } });

// --- Per-sound volume control ---
const masterGains = {};
function getMasterGain(name) {
  const ctx = getAC();
  if (!ctx) return null;
  if (!masterGains[name]) {
    masterGains[name] = ctx.createGain();
    masterGains[name].gain.value = 0.7;
    masterGains[name].connect(ctx.destination);
  }
  return masterGains[name];
}
export function setSoundVolume(name, v) {
  if (masterGains[name]) masterGains[name].gain.value = v;
}

// --- Music (SoundCloud — custom UI + Widget API for load/play) ---
export let musP = false;
let scWidget = null, scInited = false, scTrackIdx = 0, scShuffle = false, scPlaying = false;

const SC_TRACKS = [
  { url: 'https://soundcloud.com/atlas-beats-358541371/1hr-lofi-study-music', title: '1hr Lofi Study Music', artist: 'Atlas Beats' },
  { url: 'https://soundcloud.com/wyslofi/snowman-1', title: 'Snowman', artist: 'Wys' },
  { url: 'https://soundcloud.com/coldhp/existential-crisis', title: 'Existential Crisis', artist: 'Cold' },
  { url: 'https://soundcloud.com/lofi_girl/distantworlds', title: 'Distant Worlds', artist: 'Lofi Girl' },
  { url: 'https://soundcloud.com/lofi_girl/jhove-before-you-go', title: 'Before You Go', artist: 'Jhove' },
  { url: 'https://soundcloud.com/lofivela/kaplan-serenity-chillsoft-music', title: 'Serenity', artist: 'Kaplan' },
  { url: 'https://soundcloud.com/lofi_girl/chris-mazuera-x-tender-spring-perspective', title: 'Perspective', artist: 'Chris Mazuera' },
  { url: 'https://soundcloud.com/purrplecat/alone-time', title: 'Alone Time', artist: 'Purrple Cat' },
  { url: 'https://soundcloud.com/mondoloops/mondo-loops-lunar-drive', title: 'Lunar Drive', artist: 'Mondo Loops' },
  { url: 'https://soundcloud.com/mellomusicnl/childhood-memories', title: 'Childhood Memories', artist: 'Mello Music' },
  { url: 'https://soundcloud.com/hoogway/missing-earth-chilledcow-2am', title: 'Missing Earth', artist: 'Hoogway' },
];

let scLoading = false;

function scUpdateUI() {
  const t = document.getElementById('lofi-title');
  const a = document.getElementById('lofi-artist');
  const btn = document.getElementById('lofi-play');
  if (scLoading) {
    if (t) t.textContent = 'Loading…';
    if (a) a.textContent = '';
  } else {
    if (t) t.textContent = SC_TRACKS[scTrackIdx].title;
    if (a) a.textContent = SC_TRACKS[scTrackIdx].artist;
  }
  if (btn) btn.textContent = scPlaying ? '⏸' : '▶';
}

function scBindOnce(w) {
  w.bind(SC.Widget.Events.PLAY, () => {
    scLoading = false; scPlaying = true; musP = true; scUpdateUI();
  });
  w.bind(SC.Widget.Events.PAUSE, () => {
    scPlaying = false; musP = false; scUpdateUI();
  });
  w.bind(SC.Widget.Events.FINISH, () => {
    const next = scShuffle
      ? Math.floor(Math.random() * SC_TRACKS.length)
      : (scTrackIdx + 1) % SC_TRACKS.length;
    scLoadAndPlay(next);
  });
}

function scLoadAndPlay(idx) {
  scTrackIdx = idx;
  scLoading = true;
  scUpdateUI();
  const iframe = document.getElementById('sc-widget');
  if (!iframe || typeof SC === 'undefined') return;

  if (!scInited) {
    // First time: set iframe src, wait for READY, then play
    iframe.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(SC_TRACKS[idx].url)
      + '&color=%23dca864&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false';
    scWidget = SC.Widget(iframe);
    scWidget.bind(SC.Widget.Events.READY, () => {
      scBindOnce(scWidget);
      scLoading = false;
      scPlaying = true; musP = true;
      scUpdateUI();
      scWidget.play();
    });
    scInited = true;
  } else {
    // Already loaded: use widget.load() for fast swap
    scWidget.load(SC_TRACKS[idx].url, {
      auto_play: true,
      show_comments: false, hide_related: true, show_reposts: false, show_teaser: false, visual: false,
      callback: () => { scLoading = false; scWidget.play(); scUpdateUI(); }
    });
  }
}

export function startMusic() {
  scTrackIdx = Math.floor(Math.random() * SC_TRACKS.length);
  scLoadAndPlay(scTrackIdx);
}

export function stopMusic() {
  scPlaying = false; musP = false; scUpdateUI();
  if (scWidget) try { scWidget.pause(); } catch (e) { /* noop */ }
}

export function bindLofiControls() {
  const playBtn = document.getElementById('lofi-play');
  const nextBtn = document.getElementById('lofi-next');
  const prevBtn = document.getElementById('lofi-prev');
  const shuffleBtn = document.getElementById('lofi-shuffle');
  if (playBtn) playBtn.addEventListener('click', () => {
    if (scPlaying) stopMusic();
    else scLoadAndPlay(scTrackIdx);
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    scLoadAndPlay(scShuffle
      ? Math.floor(Math.random() * SC_TRACKS.length)
      : (scTrackIdx + 1) % SC_TRACKS.length);
  });
  if (prevBtn) prevBtn.addEventListener('click', () => {
    scLoadAndPlay((scTrackIdx - 1 + SC_TRACKS.length) % SC_TRACKS.length);
  });
  if (shuffleBtn) shuffleBtn.addEventListener('click', () => {
    scShuffle = !scShuffle;
    shuffleBtn.classList.toggle('active', scShuffle);
  });
  scUpdateUI();
}

// --- Rain sound ---
let rSrc = null;
export let rOn = false;

export function startRain() {
  rOn = true;
  const ctx = getAC();
  if (!ctx) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  rSrc = ctx.createBufferSource(); rSrc.buffer = buf; rSrc.loop = true;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1300; f.Q.value = .25;
  const gn = ctx.createGain(); gn.gain.value = .055;
  const mg = getMasterGain('rain');
  rSrc.connect(f); f.connect(gn); gn.connect(mg || ctx.destination); rSrc.start();
}

export function stopRain() {
  rOn = false;
  if (rSrc) { try { rSrc.stop(); } catch (e) { /* noop */ } rSrc = null; }
}

// --- Fireplace crackling ---
let fireSrc = null, fireInterval = null;
export let fireOn = false;

export function startFire() {
  fireOn = true;
  const ctx = getAC();
  if (!ctx) return;
  // Base crackle — filtered brown noise, warmer
  const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) { last = (last + (Math.random() * 2 - 1) * .1) * .998; d[i] = last; }
  fireSrc = ctx.createBufferSource(); fireSrc.buffer = buf; fireSrc.loop = true;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 350;
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 40;
  const gn = ctx.createGain(); gn.gain.value = .12;
  const mg = getMasterGain('fire');
  const dest = mg || ctx.destination;
  fireSrc.connect(lp); lp.connect(hp); hp.connect(gn); gn.connect(dest);
  fireSrc.start();
  // Soft random crackles — short filtered noise bursts, not harsh square waves
  fireInterval = setInterval(() => {
    if (!fireOn) return;
    const nb = ctx.createBuffer(1, Math.floor(ctx.sampleRate * .04), ctx.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * (.5 + Math.random() * .5);
    const ns = ctx.createBufferSource(); ns.buffer = nb;
    const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 300 + Math.random() * 400; nf.Q.value = 1.5;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(.02 + Math.random() * .03, ctx.currentTime);
    ng.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .03 + Math.random() * .05);
    ns.connect(nf); nf.connect(ng); ng.connect(dest);
    ns.start(); ns.stop(ctx.currentTime + .08);
  }, 200 + Math.random() * 500);
}

export function stopFire() {
  fireOn = false;
  if (fireSrc) { try { fireSrc.stop(); } catch (e) { /* noop */ } fireSrc = null; }
  if (fireInterval) { clearInterval(fireInterval); fireInterval = null; }
}

// --- Ocean waves ---
let waveSrc = null, waveLfo = null;
export let waveOn = false;

export function startWaves() {
  waveOn = true;
  const ctx = getAC();
  if (!ctx) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  waveSrc = ctx.createBufferSource(); waveSrc.buffer = buf; waveSrc.loop = true;
  // Bandpass for ocean-like rumble
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = .3;
  // LFO to modulate volume (wave rhythm)
  const gn = ctx.createGain(); gn.gain.value = .04;
  waveLfo = ctx.createOscillator(); waveLfo.type = 'sine'; waveLfo.frequency.value = .12;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = .03;
  waveLfo.connect(lfoGain); lfoGain.connect(gn.gain);
  const mg = getMasterGain('wave');
  waveSrc.connect(bp); bp.connect(gn); gn.connect(mg || ctx.destination);
  waveSrc.start(); waveLfo.start();
}

export function stopWaves() {
  waveOn = false;
  if (waveSrc) { try { waveSrc.stop(); } catch (e) { /* noop */ } waveSrc = null; }
  if (waveLfo) { try { waveLfo.stop(); } catch (e) { /* noop */ } waveLfo = null; }
}

// --- Birds chirping ---
let birdInterval = null;
export let birdOn = false;

export function startBirds() {
  birdOn = true;
  const ctx = getAC();
  if (!ctx) return;
  function chirp() {
    if (!birdOn) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    const baseF = 2000 + Math.random() * 3000;
    o.frequency.setValueAtTime(baseF, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(baseF + 400 + Math.random() * 800, ctx.currentTime + .05);
    o.frequency.linearRampToValueAtTime(baseF - 200, ctx.currentTime + .1);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(.015 + Math.random() * .01, ctx.currentTime + .02);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + .1 + Math.random() * .08);
    const mg = getMasterGain('bird');
    o.connect(g); g.connect(mg || ctx.destination);
    o.start(); o.stop(ctx.currentTime + .2);
    // Sometimes double chirp
    if (Math.random() > .5) setTimeout(chirp, 80 + Math.random() * 120);
  }
  birdInterval = setInterval(() => { if (birdOn) chirp(); }, 800 + Math.random() * 2000);
  chirp();
}

export function stopBirds() {
  birdOn = false;
  if (birdInterval) { clearInterval(birdInterval); birdInterval = null; }
}

// --- Wind ---
let windSrc = null;
export let windOn = false;

export function startWind() {
  windOn = true;
  const ctx = getAC();
  if (!ctx) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  windSrc = ctx.createBufferSource(); windSrc.buffer = buf; windSrc.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 250; bp.Q.value = .6;
  // Slow modulation for gusts
  const gn = ctx.createGain(); gn.gain.value = .035;
  const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = .08;
  const lg = ctx.createGain(); lg.gain.value = .025;
  lfo.connect(lg); lg.connect(gn.gain);
  const mg = getMasterGain('wind');
  windSrc.connect(bp); bp.connect(gn); gn.connect(mg || ctx.destination);
  windSrc.start(); lfo.start();
  windSrc._lfo = lfo;
}

export function stopWind() {
  windOn = false;
  if (windSrc) {
    try { windSrc.stop(); } catch (e) { /* noop */ }
    try { windSrc._lfo.stop(); } catch (e) { /* noop */ }
    windSrc = null;
  }
}
