// ============================================================
// UI — toolbar, panels, keyboard shortcuts, accessibility
// ============================================================
import { DEFS, placed, placeItem, removeItem, saveState, loadState, DEFAULT_ITEMS } from './items-registry.js';
import { BG_LIST, curBg, setCurBg } from './backgrounds.js';
import { t, tItem, tBg, toggleLang } from './i18n.js';
import { applyBr, BBASE, ceilLight, ceilSpot, fixtureMat, paperMat, lanternGlowMat, winLight } from './scene.js';
import { startMusic, stopMusic, musP, bindLofiControls, startRain, stopRain, rOn, startFire, stopFire, fireOn, startWaves, stopWaves, waveOn, startBirds, stopBirds, birdOn, startWind, stopWind, windOn, setSoundVolume } from './audio.js';

// Sound toggle map for the ambient panel
const AMBIENT_SOUNDS = {
  rain: { start: startRain, stop: stopRain, get on() { return rOn; } },
  fire: { start: startFire, stop: stopFire, get on() { return fireOn; } },
  wave: { start: startWaves, stop: stopWaves, get on() { return waveOn; } },
  bird: { start: startBirds, stop: stopBirds, get on() { return birdOn; } },
  wind: { start: startWind, stop: stopWind, get on() { return windOn; } },
};
import { editMode, locked, setEditMode, setLocked, setOnItemClick, clearHoverHighlight } from './drag.js';
import { DAY_LIGHT_BASE, NIGHT_LIGHT_BASE } from './config.js';

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

// --- Music source management ---
const MUSIC_SOURCES = ['lofi', 'spotify', 'netease'];
let currentMusicSource = 'lofi';
let musicOn = false;

// Restore saved source preference
try {
  const saved = localStorage.getItem('chilldesk_music_source');
  if (saved && MUSIC_SOURCES.includes(saved)) currentMusicSource = saved;
} catch (e) { /* noop */ }

function setMusicSource(src) {
  // Stop current source when switching away
  if (currentMusicSource === 'lofi' && src !== 'lofi') stopMusic();
  currentMusicSource = src;
  try { localStorage.setItem('chilldesk_music_source', src); } catch (e) { /* noop */ }
  // Update tabs
  document.querySelectorAll('.mtab').forEach(t => t.classList.toggle('on', t.dataset.src === src));
  // Show correct pane
  document.querySelectorAll('.msrc').forEach(s => s.classList.toggle('on', s.dataset.src === src));
  // Lazy-load iframe on first select
  const pane = document.querySelector('.msrc[data-src="' + src + '"]');
  if (pane) {
    const iframe = pane.querySelector('.music-iframe');
    if (iframe && !iframe.src && iframe.dataset.lazySrc) iframe.src = iframe.dataset.lazySrc;
  }
  // Start lo-fi if switching to it while music is on
  if (musicOn && src === 'lofi' && !musP) startMusic();
}

function toggleMusic() {
  musicOn = !musicOn;
  const btn = $('b-music');
  btn.classList.toggle('on', musicOn); ariaToggle(btn, musicOn);
  $('sp').classList.toggle('on', musicOn);
  if (placed['player']) placed['player'].g.userData.ldm.emissiveIntensity = musicOn ? 2 : 0;
  $('music-panel').classList.toggle('show', musicOn);
  if (currentMusicSource === 'lofi') {
    if (musicOn) startMusic(); else stopMusic();
  }
  if (musicOn) setMusicSource(currentMusicSource);
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
    const tr = tItem(d.id);
    tog.setAttribute('aria-label', tr[0]);
    tog.setAttribute('tabindex', '0');
    row.innerHTML = '<div class="si-icon">' + d.icon + '</div>'
      + '<div class="si-info"><span class="si-name">' + tr[0] + '</span>'
      + '<span class="si-desc">' + tr[1] + '</span></div>';
    row.appendChild(tog);
    function toggle(e) {
      e.stopPropagation();
      const id = tog.dataset.id;
      if (placed[id]) removeItem(id); else placeItem(id);
      saveState({ bg: curBg });
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
    nm.textContent = tBg(b.id); nm.dataset.bgId = b.id; row.appendChild(nm);
    row.addEventListener('click', () => {
      document.querySelectorAll('.bgo').forEach(r => { r.classList.remove('on'); r.setAttribute('aria-selected', 'false'); });
      row.classList.add('on'); row.setAttribute('aria-selected', 'true'); setCurBg(b.id);
      saveState({ bg: b.id });
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

  // Edit mode — single toggle button
  $('b-edit').addEventListener('click', function () {
    const entering = !editMode;
    setEditMode(entering);
    setLocked(!entering);
    if (!entering) clearHoverHighlight();
    this.classList.toggle('eon', entering); ariaToggle(this, entering);
    this.textContent = entering ? '🔒' : '✏️';
    this.title = entering ? t('editLock') : t('editUnlock');
    $('ebadge').classList.toggle('show', entering);
    document.body.style.cursor = entering ? 'default' : '';
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
  $('music-close').addEventListener('click', () => {
    $('music-panel').classList.remove('show');
    musicOn = false;
    if (currentMusicSource === 'lofi') stopMusic();
    const btn = $('b-music');
    btn.classList.remove('on'); ariaToggle(btn, false);
    $('sp').classList.remove('on');
    if (placed['player']) placed['player'].g.userData.ldm.emissiveIntensity = 0;
  });
  // Music source tabs
  document.querySelectorAll('.mtab').forEach(tab => {
    tab.addEventListener('click', () => setMusicSource(tab.dataset.src));
  });
  // Lo-fi player controls
  bindLofiControls();

  // --- 3D item click handlers (non-edit mode) ---
  setOnItemClick('player', () => toggleMusic());
  setOnItemClick('lamp', () => $('b-lamp').click());
  setOnItemClick('candle1', () => $('b-candle').click());
  setOnItemClick('candle2', () => $('b-candle').click());

  // Rain
  // (handled by ambient panel below)

  // --- Ambient sounds panel ---
  $('b-ambient').addEventListener('click', () => {
    $('ambient-panel').classList.toggle('show');
  });
  // Close ambient panel when clicking outside
  document.addEventListener('click', e => {
    const ap = $('ambient-panel');
    if (ap && !ap.contains(e.target) && e.target.id !== 'b-ambient') ap.classList.remove('show');
  });
  // Wire up each toggle + volume slider in the ambient panel
  const SOUND_NAME_MAP = { rain: 'rain', fire: 'fire', wave: 'wave', bird: 'bird', wind: 'wind' };
  document.querySelectorAll('.amb-row').forEach(row => {
    const sound = row.dataset.sound;
    const tog = row.querySelector('.amb-tog');
    const vol = row.querySelector('.amb-vol');
    if (!sound || !AMBIENT_SOUNDS[sound]) return;
    function toggle() {
      const s = AMBIENT_SOUNDS[sound];
      const isOn = !s.on;
      if (isOn) s.start(); else s.stop();
      tog.classList.toggle('on', isOn);
      tog.setAttribute('aria-checked', isOn ? 'true' : 'false');
      const anyOn = Object.values(AMBIENT_SOUNDS).some(x => x.on);
      $('b-ambient').classList.toggle('on', anyOn);
    }
    tog.addEventListener('click', e => { e.stopPropagation(); toggle(); saveAmbientState(); });
    tog.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); saveAmbientState(); } });
    // Volume slider
    if (vol) {
      vol.addEventListener('input', e => {
        e.stopPropagation();
        setSoundVolume(SOUND_NAME_MAP[sound], parseFloat(vol.value) / 100);
        saveAmbientState();
      });
    }
  });

  // Save/restore ambient sound state
  function saveAmbientState() {
    const state = {};
    document.querySelectorAll('.amb-row').forEach(row => {
      const s = row.dataset.sound, tog = row.querySelector('.amb-tog'), vol = row.querySelector('.amb-vol');
      if (s) state[s] = { on: tog.classList.contains('on'), vol: vol ? parseInt(vol.value) : 70 };
    });
    try { localStorage.setItem('chilldesk_ambient', JSON.stringify(state)); } catch (e) { /* noop */ }
  }
  // Restore ambient state on load
  try {
    const ambState = JSON.parse(localStorage.getItem('chilldesk_ambient'));
    if (ambState) {
      document.querySelectorAll('.amb-row').forEach(row => {
        const s = row.dataset.sound, saved = ambState[s];
        if (!saved || !AMBIENT_SOUNDS[s]) return;
        const tog = row.querySelector('.amb-tog'), vol = row.querySelector('.amb-vol');
        if (vol && saved.vol !== undefined) { vol.value = saved.vol; setSoundVolume(SOUND_NAME_MAP[s], saved.vol / 100); }
        if (saved.on) { AMBIENT_SOUNDS[s].start(); tog.classList.add('on'); tog.setAttribute('aria-checked', 'true'); }
      });
      const anyOn = Object.values(AMBIENT_SOUNDS).some(x => x.on);
      $('b-ambient').classList.toggle('on', anyOn);
    }
  } catch (e) { /* noop */ }

  // Ceiling lamp — layered glow: bright center fading outward
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
  $('b-dn').addEventListener('click', function () {
    isDayMode = !isDayMode;
    this.textContent = isDayMode ? '☀' : '🌙';
    this.classList.toggle('on', isDayMode); ariaToggle(this, isDayMode);
    if (isDayMode) {
      if (['city', 'rain', 'forest', 'space'].includes(curBg)) {
        setCurBg('morning');
        document.querySelectorAll('.bgo').forEach(r => { r.classList.remove('on'); r.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.bgo-nm').forEach(nm => {
          if (nm.dataset.bgId === 'morning') { nm.parentElement.classList.add('on'); nm.parentElement.setAttribute('aria-selected', 'true'); }
        });
      }
      BBASE.splice(0, BBASE.length, ...DAY_LIGHT_BASE);
      winLight.intensity = .9;
    } else {
      if (curBg === 'morning') setCurBg('city');
      BBASE.splice(0, BBASE.length, ...NIGHT_LIGHT_BASE);
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

  // --- Fullscreen toggle ---
  $('b-fs').addEventListener('click', function () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      this.classList.add('on');
    } else {
      document.exitFullscreen();
      this.classList.remove('on');
    }
  });
  document.addEventListener('fullscreenchange', () => {
    $('b-fs').classList.toggle('on', !!document.fullscreenElement);
  });

  // --- Reset layout ---
  $('shelf-reset').addEventListener('click', () => {
    Object.keys(placed).forEach(id => removeItem(id));
    DEFAULT_ITEMS.forEach(id => placeItem(id));
    try { localStorage.removeItem('chilldesk_state'); } catch (e) { /* noop */ }
    buildShelf();
  });

  // --- Toolbar auto-hide ---
  let hideTimer = null;
  function panelIsOpen() {
    return $('shelf').classList.contains('open') || $('bgp').classList.contains('open')
      || $('brpop').classList.contains('show') || $('ambient-panel').classList.contains('show')
      || $('music-panel').classList.contains('show');
  }
  function resetToolbarHide() {
    $('bar').classList.remove('autohide');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!panelIsOpen()) $('bar').classList.add('autohide');
    }, 4000);
  }
  document.addEventListener('mousemove', resetToolbarHide);
  document.addEventListener('touchstart', resetToolbarHide);
  resetToolbarHide();

  // --- Draggable panels (Spotify & Ambient) ---
  function makeDraggable(panelId, handleId) {
    const panel = $(panelId), handle = $(handleId);
    if (!panel || !handle) return;
    let dx = 0, dy = 0, startX = 0, startY = 0, isDragging = false;
    handle.addEventListener('mousedown', e => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      const rect = panel.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      dx = rect.left; dy = rect.top;
      panel.classList.add('dragging');
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const nx = dx + (e.clientX - startX), ny = dy + (e.clientY - startY);
      panel.style.left = nx + 'px'; panel.style.top = ny + 'px';
      panel.style.right = 'auto'; panel.style.bottom = 'auto';
      panel.style.transform = 'none';
    });
    document.addEventListener('mouseup', () => {
      isDragging = false;
      panel.classList.remove('dragging');
    });
  }
  makeDraggable('music-panel', 'music-header');
  makeDraggable('ambient-panel', 'ambient-header');

  // --- Language toggle ---
  $('b-lang').addEventListener('click', () => {
    toggleLang();
    buildShelf();
    // Rebuild bg panel names
    document.querySelectorAll('.bgo-nm').forEach(nm => {
      if (nm.dataset.bgId) nm.textContent = tBg(nm.dataset.bgId);
    });
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
      case 'a': $('b-ambient').click(); break;
      case 'n': $('b-dn').click(); break;
      case 'e': $('b-edit').click(); break;
      case 'i': $('b-items').click(); break;
      case 'b': $('b-bg').click(); break;
      case '.': $('b-bright').click(); break;
      case 'f': $('b-fs').click(); break;
      case 'escape':
        closePanels();
        $('brpop').classList.remove('show');
        $('ambient-panel').classList.remove('show');
        if (editMode) $('b-edit').click();
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
