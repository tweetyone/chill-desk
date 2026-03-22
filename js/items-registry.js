// ============================================================
// ITEM REGISTRY — definitions, place/remove, mesh collection
// ============================================================
/* global THREE */
import { scene, SURF } from './scene.js';
import { makeLamp, makePlayer, makeCandle, makePlant, makeCup, makeNotebook, makeClock, makeBooks, makeGlasses, makeTeapot, makeDigitalClock, make9Cat, makePomodoro, setOnGLBReady } from './items.js';
import { ITEM_POSITIONS, DEFAULT_ITEMS } from './config.js';

function pos(id) {
  const p = ITEM_POSITIONS[id] || [0, 0, 0, 0];
  return { p: [p[0], SURF + p[1], p[2]], ry: p[3] };
}

const ITEM_META = [
  { id: 'lamp',     icon: '💡', name: 'Desk Lamp',      desc: 'Warm brass desk lamp',       f: makeLamp },
  { id: 'plant1',   icon: '🌿', name: 'Plant A',        desc: 'Lush small potted plant',    f: () => makePlant(1) },
  { id: 'notebook', icon: '📓', name: 'Notebook',       desc: 'Open notebook',              f: makeNotebook },
  { id: 'books',    icon: '📚', name: 'Books',          desc: 'Stack of hardcovers',        f: makeBooks },
  { id: 'cup',      icon: '☕', name: 'Coffee Cup',     desc: 'Coffee cup with saucer',     f: makeCup },
  { id: 'dclock',   icon: '🕐', name: 'Digital Clock',  desc: 'LED digital clock',          f: makeDigitalClock },
  { id: 'candle1',  icon: '🕯', name: 'Candle A',       desc: 'Tall white candle',          f: () => makeCandle(.72) },
  { id: 'candle2',  icon: '🕯', name: 'Candle B',       desc: 'Short cream candle',         f: () => makeCandle(.52) },
  { id: 'player',   icon: '🎵', name: 'Vinyl Player',   desc: 'Retro vinyl record player',  f: makePlayer },
  { id: 'clock',    icon: '⏰', name: 'Clock',          desc: 'Brass desk clock',           f: makeClock },
  { id: 'plant2',   icon: '🌿', name: 'Plant B',        desc: 'Mini potted plant',          f: () => makePlant(.8) },
  { id: 'glasses',  icon: '👓', name: 'Glasses',        desc: 'Round black glasses',        f: makeGlasses },
  { id: 'teapot',   icon: '🫖', name: 'Teapot',         desc: 'Ceramic teapot',             f: makeTeapot },
  { id: 'cat9',     icon: '🐈', name: 'Cat',            desc: 'Mysterious nine-lives cat',  f: make9Cat },
  { id: 'pomo',     icon: '🍅', name: 'Pomodoro',       desc: 'Focus timer',                f: makePomodoro },
];

// Merge metadata with positions from config
export const DEFS = ITEM_META.map(m => ({ ...m, ...pos(m.id) }));

export { DEFAULT_ITEMS };
export const placed = {};
export let meshes = [];

// --- localStorage persistence ---
const STORAGE_KEY = 'chilldesk_state';

export function saveState(extra) {
  try {
    // Merge with existing saved state to preserve fields like bg
    const prev = loadState() || {};
    const items = {};
    Object.keys(placed).forEach(id => {
      const g = placed[id].g;
      items[id] = { x: g.position.x, y: g.position.y, z: g.position.z, ry: g.rotation.y };
    });
    const state = { ...prev, items, ...extra };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* storage full or unavailable */ }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

export function collectMeshes() {
  meshes = [];
  Object.keys(placed).forEach(id => {
    placed[id].g.traverse(c => {
      if (c.isMesh) { c.userData.pg = placed[id].g; meshes.push(c); }
    });
  });
}
// Re-collect meshes when GLB models finish async loading
setOnGLBReady(() => collectMeshes());

export function placeItem(id, pos) {
  if (placed[id]) return;
  const d = DEFS.find(x => x.id === id);
  if (!d) return;
  const g = d.f();
  if (pos) {
    g.position.set(pos.x, pos.y, pos.z);
    if (pos.ry !== undefined) g.rotation.y = pos.ry;
  } else {
    g.position.set(d.p[0], d.p[1], d.p[2]);
    if (d.ry) g.rotation.y = d.ry;
  }
  g.userData.id = id;
  scene.add(g);
  placed[id] = { g, d };
  collectMeshes();
}

export function removeItem(id) {
  if (!placed[id]) return;
  const g = placed[id].g;
  // Dispose textures and materials to prevent memory leaks
  g.traverse(c => {
    if (c.isMesh) {
      if (c.geometry) c.geometry.dispose();
      const mats = Array.isArray(c.material) ? c.material : [c.material];
      mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
    }
  });
  // Dispose canvas texture (e.g. digital clock)
  if (g.userData.tex) g.userData.tex.dispose();
  scene.remove(g);
  delete placed[id];
  collectMeshes();
}
