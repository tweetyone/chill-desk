// ============================================================
// UI — toolbar, panels, keyboard shortcuts, accessibility
// ============================================================
import { DEFS, placed, placeItem, removeItem } from './items-registry.js';
import { BG_LIST, curBg, setCurBg } from './backgrounds.js';
import { applyBr, BBASE, ceilLight, ceilSpot, fixtureMat, paperMat, lanternGlowMat, winLight } from './scene.js';
import { startMusic, stopMusic, musP, startRain, stopRain, rOn } from './audio.js';
import { editMode, locked, setEditMode, setLocked, setOnItemClick } from './drag.js';

// --- Helpers ---
function $(id) { return document.getElementById(id); }
function ariaToggle(btn, on) { btn.setAttribute('aria-checked', on ? 'true' : 'false'); }

// --- Panel overlay (click outside to close) ---
function closePanels() {
  $('shelf').classList.remove('open');
  $('bgp').classList.remove('open');
  $('panel-overlay').classList.remove('show');
}
function openPanel(id) {
  closePanels();
  $(id).classList.add('open');
  $('panel-overlay').classList.add('show');
}

// --- Music toggle (shared by button + record player click) ---
let spotifyVisible = false;
function toggleMusic() {
  const isOn = !musP;
  if (isOn) startMusic(); else stopMusic();
  const btn = $('b-music');
  btn.classList.toggle('on', isOn); ariaToggle(btn, isOn);
  $('sp').classList.toggle('on', isOn);
  if (placed['player']) placed['player'].g.userData.ldm.emissiveIntensity = isOn ? 2 : 0;
  $('spotify-panel').classList.toggle('show', isOn);
  spotifyVisible = isOn;
}

// --- Shelf (items panel) ---
export function buildShelf() {
  const el = $('shelf-list'); el.innerHTML = '';
  DEFS.forEach(d => {
    const on = !!placed[d.id];
    const row = document.createElement('div'); row.className = 'si'; row.setAttribute('role', 'listitem');
    const tog = document.createElement('div');
    tog.className = 'si-tog' + (on ? ' on' : '');
    tog.dataset.id = d.id;
    tog.setAttribute('role', 'switch');
    tog.setAttribute('aria-checked', on ? 'true' : 'false');
    tog.setAttribute('aria-label', d.name);
    tog.setAttribute('tabindex', '0');
    row.innerHTML = '<div class="si-icon">' + d.icon + '</div>'
      + '<div class="si-info"><span class="si-name">' + d.name + '</span>'
      + '<span class="si-desc">' + d.desc + '</span></div>';
    row.appendChild(tog);
    function toggle(e) {
      e.stopPropagation();
      const id = tog.dataset.id;
      if (placed[id]) removeItem(id); else placeItem(id);
      buildShelf();
    }
    tog.addEventListener('click', toggle);
    tog.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); } });
    el.appendChild(row);
  });
}

// --- Background panel ---
export function buildBgPanel() {
  const bl = $('bg-list');
  BG_LIST.forEach(b => {
    const row = document.createElement('div');
    row.className = 'bgo' + (b.id === curBg ? ' on' : '');
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', b.id === curBg ? 'true' : 'false');
    const sw = document.createElement('div'); sw.className = 'bgo-sw';
    sw.style.background = 'linear-gradient(135deg,' + b.c1 + ',' + b.c2 + ')';
    row.appendChild(sw);
    const nm = document.createElement('span'); nm.className = 'bgo-nm';
    nm.textContent = b.name; row.appendChild(nm);
    row.addEventListener('click', () => {
      document.querySelectorAll('.bgo').forEach(r => { r.classList.remove('on'); r.setAttribute('aria-selected', 'false'); });
      row.classList.add('on'); row.setAttribute('aria-selected', 'true'); setCurBg(b.id);
    });
    bl.appendChild(row);
  });
}

// --- Toolbar button bindings ---
export function bindToolbar() {
  // Panel buttons
  $('b-items').addEventListener('click', () => {
    if ($('shelf').classList.contains('open')) closePanels();
    else openPanel('shelf');
  });
  $('b-bg').addEventListener('click', () => {
    if ($('bgp').classList.contains('open')) closePanels();
    else openPanel('bgp');
  });
  $('panel-overlay').addEventListener('click', closePanels);

  // Edit mode
  $('b-edit').addEventListener('click', function () {
    if (locked) setLocked(false);
    setEditMode(!editMode);
    this.classList.toggle('eon', editMode); ariaToggle(this, editMode);
    $('b-lock').style.display = editMode ? 'flex' : 'none';
    $('ebadge').classList.toggle('show', editMode);
    document.body.style.cursor = editMode ? 'grab' : '';
  });
  $('b-lock').addEventListener('click', function () {
    setLocked(true); setEditMode(false);
    $('b-edit').classList.remove('eon'); ariaToggle($('b-edit'), false);
    this.style.display = 'none';
    $('ebadge').classList.remove('show');
    document.body.style.cursor = '';
  });

  // Lamp
  $('b-lamp').addEventListener('click', function () {
    const on = this.classList.toggle('on'); ariaToggle(this, on);
    if (placed['lamp']) {
      const u = placed['lamp'].g.userData;
      u.pt.intensity = on ? 3.5 : 0; u.sp.intensity = on ? 2.8 : 0; u.bm.emissiveIntensity = on ? 4.5 : 0;
    }
  });

  // Candles
  $('b-candle').addEventListener('click', function () {
    const on = this.classList.toggle('on'); ariaToggle(this, on);
    ['candle1', 'candle2'].forEach(id => {
      if (!placed[id]) return;
      const u = placed[id].g.userData; u.fg.visible = on; u.cl.intensity = on ? 1.2 : 0;
    });
  });

  // Music
  $('b-music').addEventListener('click', () => toggleMusic());
  $('spotify-close').addEventListener('click', () => { $('spotify-panel').classList.remove('show'); spotifyVisible = false; });

  // --- 3D item click handlers (non-edit mode) ---
  setOnItemClick('player', () => toggleMusic());
  setOnItemClick('lamp', () => $('b-lamp').click());
  setOnItemClick('candle1', () => $('b-candle').click());
  setOnItemClick('candle2', () => $('b-candle').click());

  // Rain
  $('b-rain').addEventListener('click', function () {
    const isOn = !rOn;
    if (isOn) startRain(); else stopRain();
    this.classList.toggle('on', isOn); ariaToggle(this, isOn);
  });

  // Ceiling lamp
  $('b-ceil').addEventListener('click', function () {
    const on = this.classList.toggle('on'); ariaToggle(this, on);
    ceilLight.intensity = on ? 1.8 : 0;
    ceilSpot.intensity = on ? 2.5 : 0;
    fixtureMat.emissiveIntensity = on ? 3.5 : 0;
    fixtureMat.opacity = on ? .65 : .15;
    paperMat.emissiveIntensity = on ? .8 : 0;
    paperMat.opacity = on ? .88 : .72;
    lanternGlowMat.emissiveIntensity = on ? 1.5 : 0;
    lanternGlowMat.opacity = on ? .35 : 0;
  });

  // Day/Night
  let isDayMode = false;
  const DAY_BBASE = [1.4, 1.2, .9, .6, .35, 0, 0];
  const NIGHT_BBASE = [.22, .18, .12, .18, .1, 0, 0];
  $('b-dn').addEventListener('click', function () {
    isDayMode = !isDayMode;
    this.textContent = isDayMode ? '☀' : '🌙';
    this.classList.toggle('on', isDayMode); ariaToggle(this, isDayMode);
    if (isDayMode) {
      if (['city', 'rain', 'forest', 'space'].includes(curBg)) {
        setCurBg('morning');
        document.querySelectorAll('.bgo').forEach(r => { r.classList.remove('on'); r.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.bgo-nm').forEach(nm => {
          if (nm.textContent === '清晨破晓') { nm.parentElement.classList.add('on'); nm.parentElement.setAttribute('aria-selected', 'true'); }
        });
      }
      BBASE.splice(0, BBASE.length, ...DAY_BBASE);
      winLight.intensity = .9;
    } else {
      if (curBg === 'morning') setCurBg('city');
      BBASE.splice(0, BBASE.length, ...NIGHT_BBASE);
      winLight.intensity = .12;
    }
    applyBr(parseInt($('brs').value));
  });

  // Brightness
  $('b-bright').addEventListener('click', () => $('brpop').classList.toggle('show'));
  document.addEventListener('click', e => {
    const pp = $('brpop');
    if (!pp.contains(e.target) && e.target.id !== 'b-bright') pp.classList.remove('show');
  });
  $('brs').addEventListener('input', function () {
    $('brv').textContent = this.value;
    applyBr(parseInt(this.value));
  });

  // --- Keyboard shortcuts ---
  document.addEventListener('keydown', e => {
    // Skip if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const key = e.key.toLowerCase();
    switch (key) {
      case 'l': $('b-lamp').click(); break;
      case 'c': $('b-ceil').click(); break;
      case 'k': $('b-candle').click(); break;
      case 'm': $('b-music').click(); break;
      case 'r': $('b-rain').click(); break;
      case 'n': $('b-dn').click(); break;
      case 'e': $('b-edit').click(); break;
      case 'i': $('b-items').click(); break;
      case 'b': $('b-bg').click(); break;
      case '.': $('b-bright').click(); break;
      case 'escape':
        closePanels();
        $('brpop').classList.remove('show');
        if (editMode) $('b-lock').click();
        break;
    }
  });

  // --- Keyboard hint (show briefly on load) ---
  const hint = $('keyhint');
  if (hint) {
    setTimeout(() => hint.classList.add('show'), 1500);
    setTimeout(() => hint.classList.remove('show'), 6000);
  }
}
