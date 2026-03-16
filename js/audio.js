// ============================================================
// AUDIO — ambient music synth + rain white noise
// ============================================================

let audC = null;
function getAC() { if (!audC) audC = new (window.AudioContext || window.webkitAudioContext)(); return audC; }

// --- Music ---
const musN = {};
export let musP = false;

export function startMusic() {
  musP = true;
  const ctx = getAC(), ms = ctx.createGain();
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
  const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  rSrc = ctx.createBufferSource(); rSrc.buffer = buf; rSrc.loop = true;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1300; f.Q.value = .25;
  const gn = ctx.createGain(); gn.gain.value = .055;
  rSrc.connect(f); f.connect(gn); gn.connect(ctx.destination); rSrc.start();
}

export function stopRain() {
  rOn = false;
  if (rSrc) { try { rSrc.stop(); } catch (e) { /* noop */ } rSrc = null; }
}
