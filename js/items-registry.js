// ============================================================
// ITEM REGISTRY — definitions, place/remove, mesh collection
// ============================================================
/* global THREE */
import { scene, SURF } from './scene.js';
import { makeLamp, makePlayer, makeCandle, makePlant, makeCup, makeNotebook, makeClock, makeBooks, makeGlasses, makeTeapot, makeDigitalClock } from './items.js';
import { ITEM_POSITIONS, DEFAULT_ITEMS } from './config.js';

function pos(id) {
  const p = ITEM_POSITIONS[id] || [0, 0, 0, 0];
  return { p: [p[0], SURF + p[1], p[2]], ry: p[3] };
}

const ITEM_META = [
  { id: 'lamp',     icon: '💡', name: '台灯',     desc: '温暖黄铜台灯',   f: makeLamp },
  { id: 'plant1',   icon: '🌿', name: '绿植 A',   desc: '茂密小盆栽',     f: () => makePlant(1) },
  { id: 'notebook', icon: '📓', name: '笔记本',   desc: '翻开的笔记本',   f: makeNotebook },
  { id: 'books',    icon: '📚', name: '书本',     desc: '一摞精装书',     f: makeBooks },
  { id: 'cup',      icon: '☕', name: '咖啡杯',   desc: '带碟咖啡杯',     f: makeCup },
  { id: 'dclock',   icon: '🕐', name: '电子钟',   desc: 'LED数字时钟',   f: makeDigitalClock },
  { id: 'candle1',  icon: '🕯', name: '蜡烛 A',   desc: '高挑米白蜡烛',   f: () => makeCandle(.72) },
  { id: 'candle2',  icon: '🕯', name: '蜡烛 B',   desc: '矮胖奶油蜡烛',   f: () => makeCandle(.52) },
  { id: 'player',   icon: '🎵', name: '黑胶唱机', desc: '复古黑胶唱片机', f: makePlayer },
  { id: 'clock',    icon: '⏰', name: '座钟',     desc: '黄铜怀旧座钟',   f: makeClock },
  { id: 'plant2',   icon: '🌿', name: '绿植 B',   desc: '迷你盆栽',       f: () => makePlant(.8) },
  { id: 'glasses',  icon: '👓', name: '眼镜',     desc: '圆框黑色眼镜',   f: makeGlasses },
  { id: 'teapot',   icon: '🫖', name: '茶壶',     desc: '陶瓷小茶壶',     f: makeTeapot },
];

// Merge metadata with positions from config
export const DEFS = ITEM_META.map(m => ({ ...m, ...pos(m.id) }));

export { DEFAULT_ITEMS };
export const placed = {};
export let meshes = [];

export function collectMeshes() {
  meshes = [];
  Object.keys(placed).forEach(id => {
    placed[id].g.traverse(c => {
      if (c.isMesh) { c.userData.pg = placed[id].g; meshes.push(c); }
    });
  });
}

export function placeItem(id) {
  if (placed[id]) return;
  const d = DEFS.find(x => x.id === id);
  if (!d) return;
  const g = d.f();
  g.position.set(d.p[0], d.p[1], d.p[2]);
  if (d.ry) g.rotation.y = d.ry;
  g.userData.id = id;
  scene.add(g);
  placed[id] = { g, d };
  collectMeshes();
}

export function removeItem(id) {
  if (!placed[id]) return;
  scene.remove(placed[id].g);
  delete placed[id];
  collectMeshes();
}
