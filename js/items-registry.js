// ============================================================
// ITEM REGISTRY — definitions, place/remove, mesh collection
// ============================================================
/* global THREE */
import { scene, SURF } from './scene.js';
import { makeLamp, makePlayer, makeCandle, makePlant, makeCup, makeNotebook, makeClock, makeBooks, makeGlasses, makeTeapot, makeDigitalClock } from './items.js';

export const DEFS = [
  { id: 'lamp',    icon: '💡', name: '台灯',     desc: '温暖黄铜台灯',   f: makeLamp,                           p: [-5.5, SURF, -1.5], ry: 0 },
  { id: 'player',  icon: '🎵', name: '黑胶唱机', desc: '复古黑胶唱片机', f: makePlayer,                         p: [3.5, SURF + .25, -1.2], ry: 0 },
  { id: 'candle1', icon: '🕯', name: '蜡烛 A',   desc: '高挑米白蜡烛',   f: () => makeCandle(.72),              p: [1, SURF, .5], ry: 0 },
  { id: 'candle2', icon: '🕯', name: '蜡烛 B',   desc: '矮胖奶油蜡烛',   f: () => makeCandle(.52),              p: [1.8, SURF, -.2], ry: 0 },
  { id: 'plant1',  icon: '🌿', name: '绿植 A',   desc: '茂密小盆栽',     f: () => makePlant(1),                 p: [-4.6, SURF, 1.6], ry: 0 },
  { id: 'plant2',  icon: '🌿', name: '绿植 B',   desc: '迷你盆栽',       f: () => makePlant(.8),                p: [3.2, SURF, 1.9], ry: 0 },
  { id: 'cup',     icon: '☕', name: '咖啡杯',   desc: '带碟咖啡杯',     f: makeCup,                            p: [-1.8, SURF + .033, .9], ry: 0 },
  { id: 'notebook',icon: '📓', name: '笔记本',   desc: '翻开的笔记本',   f: makeNotebook,                       p: [-2.8, SURF + .033, .45], ry: .18 },
  { id: 'clock',   icon: '⏰', name: '座钟',     desc: '黄铜怀旧座钟',   f: makeClock,                          p: [2.2, SURF + .065, -.55], ry: 0 },
  { id: 'books',   icon: '📚', name: '书本',     desc: '一摞精装书',     f: makeBooks,                          p: [-4.6, SURF, -.6], ry: 0 },
  { id: 'glasses', icon: '👓', name: '眼镜',     desc: '圆框黑色眼镜',   f: makeGlasses,                        p: [.5, SURF + .012, 1.1], ry: 0 },
  { id: 'teapot',  icon: '🫖', name: '茶壶',     desc: '陶瓷小茶壶',     f: makeTeapot,                         p: [1.5, SURF + .28, 1.6], ry: 0 },
  { id: 'dclock', icon: '🕐', name: '电子钟',   desc: 'LED数字时钟',   f: makeDigitalClock,                   p: [3, SURF, .8], ry: 0 },
];

export const placed = {};
export let meshes = [];
export const DEFAULT_ITEMS = ['lamp', 'player', 'candle1', 'plant1', 'cup', 'clock', 'notebook', 'books', 'dclock'];

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
