// ============================================================
// MAIN — entry point, loading screen, animation loop
// ============================================================
/* global THREE */
import { renderer, scene, camera, onResize, rPts, tickCamTween } from './scene.js';
import { resizeBg, drawBg, setCurBg } from './backgrounds.js';
import { placed, placeItem, DEFAULT_ITEMS, loadState, saveState } from './items-registry.js';
import { rOn } from './audio.js';
import { buildShelf, buildBgPanel, bindToolbar } from './ui.js';
import { AUTO_ENABLE } from './config.js';
import { setOnItemClick } from './drag.js';

// --- Pomodoro focus timer (3D desk object) ---
const POMO_WORK = 25 * 60, POMO_BREAK = 5 * 60;
let pomoState = 'idle', pomoRemain = POMO_WORK, pomoTotal = POMO_WORK;
let pomoPausedFrom = '', pomoLastTick = 0;

// Hide HTML pomodoro element
const pomoHtmlEl = document.getElementById('pomo');
if (pomoHtmlEl) pomoHtmlEl.style.display = 'none';

function pomoChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, ctx.currentTime + i * .15);
      g.gain.linearRampToValueAtTime(.08, ctx.currentTime + i * .15 + .05);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + i * .15 + .4);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + i * .15);
      o.stop(ctx.currentTime + i * .15 + .5);
    });
  } catch (e) { /* noop */ }
}

export function pomoClick() {
  if (pomoState === 'idle') {
    pomoState = 'work'; pomoRemain = POMO_WORK; pomoTotal = POMO_WORK;
    pomoLastTick = performance.now();
  } else if (pomoState === 'work' || pomoState === 'break') {
    pomoPausedFrom = pomoState; pomoState = 'paused';
  } else if (pomoState === 'paused') {
    pomoState = pomoPausedFrom; pomoLastTick = performance.now();
  }
}

export function pomoReset() {
  pomoState = 'idle'; pomoRemain = POMO_WORK; pomoTotal = POMO_WORK;
}

function tickPomo(now) {
  if (pomoState !== 'work' && pomoState !== 'break') return;
  const dt = (now - pomoLastTick) / 1000;
  pomoLastTick = now;
  pomoRemain -= dt;
  if (pomoRemain <= 0) {
    pomoChime();
    if (pomoState === 'work') {
      pomoState = 'break'; pomoRemain = POMO_BREAK; pomoTotal = POMO_BREAK;
    } else {
      pomoState = 'idle'; pomoRemain = POMO_WORK; pomoTotal = POMO_WORK;
    }
  }
}

function drawPomoFace() {
  if (!placed['pomo']) return;
  const u = placed['pomo'].g.userData;
  const ctx = u.pomoCtx, cv = u.pomoCanvas;
  if (!ctx) return;
  ctx.clearRect(0, 0, 512, 512);
  // Red tomato base
  const bg = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
  bg.addColorStop(0, '#bb2a1a');
  bg.addColorStop(1, '#991818');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 512);
  // Text on front face — compress horizontally to counter sphere UV stretch
  const tx = 128, ty = 260;
  ctx.save();
  ctx.translate(tx, ty);
  ctx.scale(.5, 1);
  const m = Math.floor(pomoRemain / 60), s = Math.floor(pomoRemain % 60);
  const timeStr = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Time — carved inset look
  ctx.font = 'bold 80px monospace';
  // Shadow (inset)
  ctx.fillStyle = 'rgba(40,5,2,.6)';
  ctx.fillText(timeStr, 2, 3);
  // Main text
  ctx.fillStyle = 'rgba(255,230,180,.9)';
  ctx.fillText(timeStr, 0, 0);
  // Label
  const label = pomoState === 'idle' ? 'FOCUS' : pomoState === 'work' ? 'WORK' : pomoState === 'break' ? 'BREAK' : 'PAUSED';
  ctx.font = '34px sans-serif';
  ctx.fillStyle = 'rgba(40,5,2,.5)';
  ctx.fillText(label, 2, -61);
  ctx.fillStyle = 'rgba(255,230,180,.7)';
  ctx.fillText(label, 0, -64);
  ctx.restore();
  u.pomoTex.needsUpdate = true;
  // Glowing ring on desk surface when working
  if (!u.pomoRing) {
    // Flat transparent ring mesh on the desk surface
    const ringGeo = new THREE.RingGeometry(.25, .5, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff8844, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = .01; // just above desk surface
    placed['pomo'].g.add(ring);
    u.pomoRing = ring;
    u.pomoRingMat = ringMat;
  }
  if (pomoState === 'work') {
    u.pomoRingMat.color.setHex(0xff8844);
    u.pomoRingMat.opacity = .15;
  } else if (pomoState === 'break') {
    u.pomoRingMat.color.setHex(0x44cc88);
    u.pomoRingMat.opacity = .12;
  } else {
    u.pomoRingMat.opacity = 0;
  }
}

// --- Loading screen ---
const lb = document.getElementById('lb');
let lp = 0;
const lfk = setInterval(() => { lp = Math.min(lp + Math.random() * 22, 88); lb.style.width = lp + '%'; }, 80);

// Floating particles on loading screen
const lpCv = document.getElementById('load-particles');
if (lpCv) {
  const lpCx = lpCv.getContext('2d');
  lpCv.width = innerWidth; lpCv.height = innerHeight;
  const dots = [];
  for (let i = 0; i < 40; i++) dots.push({ x: Math.random() * lpCv.width, y: Math.random() * lpCv.height, r: .5 + Math.random() * 1.5, vx: (Math.random() - .5) * .3, vy: -.15 - Math.random() * .3, o: Math.random() * .4 + .1, ph: Math.random() * 6.28 });
  let lpAf = 0;
  function drawLoadParticles() {
    if (!lpCv.parentElement || lpCv.parentElement.style.display === 'none') return;
    lpCx.clearRect(0, 0, lpCv.width, lpCv.height);
    lpAf++;
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.y < -10) { d.y = lpCv.height + 10; d.x = Math.random() * lpCv.width; }
      const flicker = d.o * (.7 + .3 * Math.sin(lpAf * .02 + d.ph));
      lpCx.beginPath(); lpCx.arc(d.x, d.y, d.r, 0, 6.28);
      lpCx.fillStyle = 'rgba(220,175,100,' + flicker.toFixed(3) + ')'; lpCx.fill();
    });
    requestAnimationFrame(drawLoadParticles);
  }
  drawLoadParticles();
}

// --- Clock ---
function updClock() {
  const n = new Date(), h = n.getHours() % 12, m = n.getMinutes(), s = n.getSeconds(), ms = n.getMilliseconds();
  const sd = (s + ms / 1000) * Math.PI / 30;
  const md = (m + s / 60) * Math.PI / 30;
  const hd = (h + m / 60) * Math.PI / 6;
  if (placed['clock']) {
    const u = placed['clock'].g.userData;
    u.sH.rotation.y = -sd; u.mH.rotation.y = -md; u.hH.rotation.y = -hd;
    u.sH.position.set(Math.sin(-sd) * .075, .094, Math.cos(-sd) * .075);
    u.mH.position.set(Math.sin(-md) * .06, .094, Math.cos(-md) * .06);
    u.hH.position.set(Math.sin(-hd) * .045, .094, Math.cos(-hd) * .045);
  }
  // Digital clock
  if (placed['dclock']) {
    const u = placed['dclock'].g.userData;
    const ctx = u.ctx, cv = u.canvas;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#001a0a';
    ctx.fillRect(0, 0, cv.width, cv.height);
    const pad = x => String(x).padStart(2, '0');
    const timeStr = pad(n.getHours()) + ':' + pad(m) + ':' + pad(s);
    // Main time
    ctx.font = 'bold 52px monospace';
    ctx.fillStyle = '#00ff66';
    ctx.shadowColor = '#00ff66';
    ctx.shadowBlur = 12;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(timeStr, cv.width / 2, cv.height / 2 - 4);
    ctx.shadowBlur = 0;
    // Date line
    const dateStr = n.getFullYear() + '/' + pad(n.getMonth() + 1) + '/' + pad(n.getDate());
    ctx.font = '14px monospace';
    ctx.fillStyle = '#00aa44';
    ctx.fillText(dateStr, cv.width / 2, cv.height - 12);
    u.tex.needsUpdate = true;
    // Blink the colon LED
    u.ledMat.emissiveIntensity = s % 2 === 0 ? 1.5 : .3;
  }
  const p = x => String(x).padStart(2, '0');
  document.getElementById('td').textContent = p(n.getHours()) + ' : ' + p(m) + ' : ' + p(s);
}

// --- Animation loop ---
// Use elapsed time (seconds) for frame-rate independent animations
let prevTime = 0, elapsed = 0;
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - prevTime) / 1000, 0.1); // cap at 100ms to avoid jumps
  prevTime = now;
  elapsed += dt;

  // Candle flicker
  ['candle1', 'candle2'].forEach((id, ix) => {
    if (!placed[id]) return;
    const u = placed[id].g.userData;
    if (u.cl && u.cl.intensity > 0) {
      u.cl.intensity = .7 + Math.sin(elapsed * 11.4 + ix * 2.3) * .18 + Math.random() * .12;
      u.cl.color.setHSL(.08 + Math.random() * .015, 1, .55);
      if (u.fg) { u.fg.rotation.z = Math.sin(elapsed * 6.6 + ix) * .09; u.fg.rotation.x = Math.cos(elapsed * 4.8 + ix * .7) * .06; }
    }
  });

  // Tonearm animation
  const bMusicEl = document.getElementById('b-music');
  const musicActive = bMusicEl && bMusicEl.classList.contains('on');
  if (placed['player']) {
    const pu = placed['player'].g.userData;
    if (pu.ta) {
      const target = musicActive ? Math.PI / 6 : Math.PI / 2.2;
      pu.ta.rotation.y += (target - pu.ta.rotation.y) * 3 * dt;
    }
  }

  // Coffee steam wisps
  if (placed['cup']) {
    const wisps = placed['cup'].g.userData.steamWisps;
    if (wisps) {
      wisps.forEach(w => {
        w.age += w.speed * dt * 60; // normalize to ~60fps baseline
        if (w.age > 1) { w.age = 0; w.line.position.set((Math.random() - .5) * .12, 0, (Math.random() - .5) * .12); }
        const pos = w.line.geometry.attributes.position.array;
        for (let s = 0; s <= 8; s++) {
          const t = s / 8;
          pos[s * 3]     = Math.sin(elapsed * 1.8 + w.phase + t * 2) * .03 * (1 + t);
          pos[s * 3 + 1] = (w.age + t * .08) * .5;
          pos[s * 3 + 2] = Math.cos(elapsed * 1.5 + w.phase * 1.3 + t * 1.5) * .02 * (1 + t);
        }
        w.line.geometry.attributes.position.needsUpdate = true;
        w.line.material.opacity = .45 * (1 - w.age) * (.7 + Math.sin(elapsed * 2.4 + w.phase) * .3);
      });
    }
  }

  // Update GLB animation mixers for all placed items
  Object.keys(placed).forEach(id => {
    const u = placed[id].g.userData;
    if (u.mixer) u.mixer.update(dt);
  });

  // Procedural idle animations for GLB desk pets
  ['cat9'].forEach(id => {
    if (!placed[id]) return;
    const u = placed[id].g.userData;
    if (u.model) {
      // Gentle breathing (scale pulse)
      u.model.scale.y = u.model.scale.x * (1 + Math.sin(elapsed * 1.8) * .02);
      // Subtle side-to-side sway
      u.model.rotation.z = Math.sin(elapsed * .9 + id.length) * .03;
      // Head bob (applies to the whole model since we can't target head bone)
      u.model.position.y = (u.model.position.y || 0) + Math.sin(elapsed * 2.2 + id.length * 1.5) * .001;
    }
  });

  // Desk pets: no auto-wandering — user drags them in edit mode

  // 3D rain particles (fixed step — visual effect, no need for delta-time)
  if (rOn && rPts) {
    rPts.visible = true;
    const pa = rPts.geometry.attributes.position.array;
    for (let i = 0; i < pa.length; i += 3) { pa[i + 1] -= .13; pa[i] -= .015; if (pa[i + 1] < -2) { pa[i + 1] = 20; pa[i] = (Math.random() - .5) * 30; } }
    rPts.geometry.attributes.position.needsUpdate = true;
  } else if (rPts) { rPts.visible = false; }

  tickPomo(now);
  drawPomoFace();
  tickCamTween(dt);
  drawBg();
  updClock();
  renderer.render(scene, camera);
}

// --- Resize ---
window.addEventListener('resize', () => { onResize(); resizeBg(); });

// --- Start ---
const saved = loadState();
if (saved && saved.items && Object.keys(saved.items).length > 0) {
  Object.keys(saved.items).forEach(id => placeItem(id, saved.items[id]));
  if (saved.bg) setCurBg(saved.bg);
} else {
  DEFAULT_ITEMS.forEach(id => placeItem(id));
}
buildShelf();
buildBgPanel();
bindToolbar();

// Pomodoro 3D click handler
setOnItemClick('pomo', () => pomoClick());

// Auto-enable features from config
// (moved into startup callback below)

clearInterval(lfk);
setTimeout(() => {
  lb.style.width = '100%';
  setTimeout(() => {
    const el = document.getElementById('load'); el.style.opacity = '0';
    setTimeout(() => { el.style.display = 'none'; }, 1000);
  }, 300);
  prevTime = performance.now();
  requestAnimationFrame(animate);
  // Auto-enable after everything is running
  setTimeout(() => {
    AUTO_ENABLE.forEach(id => {
      const btn = document.getElementById(id);
      if (btn && !btn.classList.contains('on')) btn.click();
    });
  }, 100);
}, 500);
