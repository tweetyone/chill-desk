// ============================================================
// AUDIO — ambient music synth + rain white noise
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

// --- Music ---
const musN = {};
export let musP = false;

export function startMusic() {
  musP = true;
  const ctx = getAC();
  if (!ctx) return;
  const ms = ctx.createGain();
  ms.gain.value = .07; ms.connect(ctx.destination);
  const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 850; fl.connect(ms);
  const ch = [[130.81, 164.81, 196], [110, 138.59, 164.81], [87.31, 110, 130.81], [98, 123.47, 146.83]];
  let ci = 0, os = [];
  function pc() {
    os.forEach(o => { try { o.stop(); } catch (e) { /* noop */ } }); os = [];
    ch[ci % 4].forEach(f => {
      const o = ctx.createOscillator(), gn = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = f; o.connect(gn); gn.connect(fl);
      gn.gain.setValueAtTime(0, ctx.currentTime);
      gn.gain.linearRampToValueAtTime(.35, ctx.currentTime + .9);
      gn.gain.linearRampToValueAtTime(.1, ctx.currentTime + 3.8);
      gn.gain.linearRampToValueAtTime(0, ctx.currentTime + 5.2);
      o.start(); os.push(o);
    }); ci++;
  }
  pc();
  musN.ci = setInterval(() => { if (musP) pc(); }, 5200);
  musN.ms = ms;
}

export function stopMusic() {
  musP = false;
  clearInterval(musN.ci);
  if (musN.ms && audC) musN.ms.gain.linearRampToValueAtTime(0, audC.currentTime + .8);
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
