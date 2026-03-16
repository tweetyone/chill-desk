// ============================================================
// MAIN — entry point, loading screen, animation loop
// ============================================================
/* global THREE */
import { renderer, scene, camera, onResize, rPts } from './scene.js';
import { resizeBg, drawBg } from './backgrounds.js';
import { placed, placeItem, DEFAULT_ITEMS } from './items-registry.js';
import { musP, rOn } from './audio.js';
import { buildShelf, buildBgPanel, bindToolbar } from './ui.js';
import './drag.js'; // side-effect: registers event listeners

// --- Loading screen ---
const lb = document.getElementById('lb');
let lp = 0;
const lfk = setInterval(() => { lp = Math.min(lp + Math.random() * 22, 88); lb.style.width = lp + '%'; }, 80);

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
let fr = 0;
function animate() {
  requestAnimationFrame(animate); fr++;

  // Candle flicker
  ['candle1', 'candle2'].forEach((id, ix) => {
    if (!placed[id]) return;
    const u = placed[id].g.userData;
    if (u.cl && u.cl.intensity > 0) {
      u.cl.intensity = .7 + Math.sin(fr * .19 + ix * 2.3) * .18 + Math.random() * .12;
      u.cl.color.setHSL(.08 + Math.random() * .015, 1, .55);
      if (u.fg) { u.fg.rotation.z = Math.sin(fr * .11 + ix) * .09; u.fg.rotation.x = Math.cos(fr * .08 + ix * .7) * .06; }
    }
  });

  // Vinyl spin
  if (placed['player'] && musP) {
    const pu = placed['player'].g.userData;
    if (pu.disc) pu.disc.rotation.y += .018;
    if (pu.lbl) pu.lbl.rotation.y += .018;
  }

  // Coffee steam wisps
  if (placed['cup']) {
    const wisps = placed['cup'].g.userData.steamWisps;
    if (wisps) {
      wisps.forEach(w => {
        w.age += w.speed;
        if (w.age > 1) { w.age = 0; w.line.position.set((Math.random() - .5) * .12, 0, (Math.random() - .5) * .12); }
        // Update curve points to create rising, swaying motion
        const pos = w.line.geometry.attributes.position.array;
        for (let s = 0; s <= 8; s++) {
          const t = s / 8;
          pos[s * 3]     = Math.sin(fr * .03 + w.phase + t * 2) * .03 * (1 + t);
          pos[s * 3 + 1] = (w.age + t * .08) * .5;
          pos[s * 3 + 2] = Math.cos(fr * .025 + w.phase * 1.3 + t * 1.5) * .02 * (1 + t);
        }
        w.line.geometry.attributes.position.needsUpdate = true;
        w.line.material.opacity = .45 * (1 - w.age) * (.7 + Math.sin(fr * .04 + w.phase) * .3);
      });
    }
  }

  // 3D rain particles
  if (rOn && rPts) {
    rPts.visible = true;
    const pa = rPts.geometry.attributes.position.array;
    for (let i = 0; i < pa.length; i += 3) { pa[i + 1] -= .13; pa[i] -= .015; if (pa[i + 1] < -2) { pa[i + 1] = 20; pa[i] = (Math.random() - .5) * 30; } }
    rPts.geometry.attributes.position.needsUpdate = true;
  } else if (rPts) { rPts.visible = false; }

  drawBg();
  updClock();
  renderer.render(scene, camera);
}

// --- Resize ---
window.addEventListener('resize', () => { onResize(); resizeBg(); });

// --- Start ---
DEFAULT_ITEMS.forEach(id => placeItem(id));
buildShelf();
buildBgPanel();
bindToolbar();

clearInterval(lfk);
setTimeout(() => {
  lb.style.width = '100%';
  setTimeout(() => {
    const el = document.getElementById('load'); el.style.opacity = '0';
    setTimeout(() => { el.style.display = 'none'; }, 1000);
  }, 300);
  animate();
}, 500);
