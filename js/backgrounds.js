// ============================================================
// 2D BACKGROUND CANVAS — draws animated city/rain/forest/etc
// ============================================================

const bgCv = document.getElementById('bg');
const bgCx = bgCv.getContext('2d');
let bgFr = 0;
export let curBg = 'city';
export function setCurBg(id) {
  if (id === curBg) return;
  // Crossfade: snapshot current canvas, then transition
  const snap = document.getElementById('bg-snap');
  if (snap && bgCv.width > 0) {
    try {
      snap.style.backgroundImage = 'url(' + bgCv.toDataURL() + ')';
      snap.style.opacity = '1';
      // Start fading out snapshot after a frame
      requestAnimationFrame(() => { snap.style.opacity = '0'; });
    } catch (e) { /* canvas tainted or unavailable */ }
  }
  curBg = id;
}

export function resizeBg() { bgCv.width = innerWidth; bgCv.height = innerHeight; }
resizeBg();

// --- Pre-generated data ---
const BLDS = [];
(function () {
  [[0,62,82],[58,42,56],[92,72,102],[158,46,72],[198,56,88],[248,36,52],[278,82,112],
   [352,52,76],[398,46,62],[438,66,96],[498,42,66],[532,76,82],[602,56,72],[652,52,92],
   [694,62,62],[748,82,102],[822,52,76],[868,66,88],[928,46,56],[968,72,96],
   [1032,56,72],[1082,46,82],[1178,42,92]].forEach(function (b) {
    const ws = [], cols = Math.floor(b[1] / 12), rows = Math.floor(b[2] / 16);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (Math.random() > .42) ws.push({ x: 4 + c * 12, y: 6 + r * 16, on: Math.random() > .32, blink: Math.random() > .72, ph: Math.random() * 6.28 });
    BLDS.push({ x: b[0], w: b[1], h: b[2], ws });
  });
})();

const STARS = [];
for (let i = 0; i < 220; i++) STARS.push({ x: Math.random(), y: Math.random() * .9, r: .4 + Math.random() * 1.4, ph: Math.random() * 6.28 });

// Pine trees — multiple layers with varying sizes and depths
const PINES = [];
for (let i = 0; i < 35; i++) {
  PINES.push({
    x: Math.random(),
    h: .12 + Math.random() * .28,       // total height
    layers: 3 + Math.floor(Math.random() * 3), // 3-5 branch layers
    depth: Math.random(),                // for parallax/size sorting
    sway: Math.random() * 6.28,         // wind sway phase
    dk: .3 + Math.random() * .7         // darkness variation
  });
}
PINES.sort((a, b) => a.depth - b.depth); // draw far trees first

const RDPS = [];
for (let i = 0; i < 160; i++) RDPS.push({ x: Math.random() * 2200, y: Math.random() * 900, l: 10 + Math.random() * 22, s: 4 + Math.random() * 5, o: .18 + Math.random() * .4 });

// --- Drawing helpers ---
function dStars(cx, w, h) {
  STARS.forEach(function (s) {
    const op = .22 + .62 * Math.abs(Math.sin(bgFr * .018 + s.ph));
    cx.beginPath(); cx.arc(s.x * w, s.y * h, s.r, 0, 6.28);
    cx.fillStyle = 'rgba(255,255,255,' + op.toFixed(2) + ')'; cx.fill();
  });
}

function dMoon(cx, w, h, mx, my) {
  const x = w * mx, y = h * my;
  const g = cx.createRadialGradient(x, y, 0, x, y, h * .058);
  g.addColorStop(0, 'rgba(255,252,215,1)'); g.addColorStop(.6, 'rgba(238,218,145,.88)'); g.addColorStop(1, 'rgba(238,218,145,0)');
  cx.fillStyle = g; cx.fillRect(0, 0, w, h);
  cx.beginPath(); cx.arc(x, y, h * .035, 0, 6.28); cx.fillStyle = 'rgba(254,246,205,.95)'; cx.fill();
}

function dBlds(cx, w, h, wall, win) {
  const sc = w / 1260;
  BLDS.forEach(function (b) {
    const bx = b.x * sc, bw = b.w * sc, bh = b.h * (h / 500);
    cx.fillStyle = wall; cx.fillRect(bx, h - bh, bw, bh);
    b.ws.forEach(function (ww) {
      let lit = ww.on;
      if (ww.blink) lit = lit && Math.sin(bgFr * .045 + ww.ph) > 0;
      if (lit) { cx.fillStyle = win; cx.fillRect(bx + ww.x * sc, h - bh + ww.y * (h / 500), 6 * sc, 8 * (h / 500)); }
    });
  });
}

function dPine(cx, px, baseY, th, layers, dk, w) {
  // Trunk
  const trunkW = th * w * .018;
  const trunkH = th * .35;
  cx.fillStyle = 'rgba(' + Math.floor(30 * dk) + ',' + Math.floor(18 * dk) + ',' + Math.floor(8 * dk) + ',1)';
  cx.fillRect(px - trunkW / 2, baseY - trunkH, trunkW, trunkH);
  // Branch layers — triangles stacked, each wider and lower
  const treeTop = baseY - th;
  for (let i = 0; i < layers; i++) {
    const frac = i / layers;
    const layerY = treeTop + th * .15 + frac * th * .55;
    const layerW = th * (.12 + frac * .32);
    const layerH = th * (.2 + frac * .08);
    const g = Math.floor(12 + dk * 18 + i * 3);
    const r = Math.floor(2 + dk * 6);
    const b = Math.floor(4 + dk * 6);
    cx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    cx.beginPath();
    cx.moveTo(px, layerY - layerH * .3);
    cx.lineTo(px - layerW, layerY + layerH);
    cx.lineTo(px + layerW, layerY + layerH);
    cx.closePath();
    cx.fill();
  }
  // Snow caps on tips (subtle)
  cx.fillStyle = 'rgba(180,200,210,' + (0.06 + dk * .08).toFixed(2) + ')';
  cx.beginPath();
  cx.moveTo(px, treeTop + th * .1);
  cx.lineTo(px - th * .04, treeTop + th * .2);
  cx.lineTo(px + th * .04, treeTop + th * .2);
  cx.closePath();
  cx.fill();
}

function dTrees(cx, w, h) {
  // Ground fog at bottom
  const fogG = cx.createLinearGradient(0, h * .82, 0, h);
  fogG.addColorStop(0, 'rgba(4,14,6,0)');
  fogG.addColorStop(.5, 'rgba(4,14,6,.4)');
  fogG.addColorStop(1, 'rgba(4,14,6,.8)');
  // Far layer (smaller, darker)
  PINES.forEach(t => {
    if (t.depth > .5) return;
    const sc = .4 + t.depth * .6;
    const th = t.h * h * sc;
    const px = t.x * w;
    const baseY = h - h * .02 * (1 - t.depth);
    dPine(cx, px, baseY, th, t.layers, t.dk * .4, w);
  });
  // Near layer (larger, brighter)
  PINES.forEach(t => {
    if (t.depth <= .5) return;
    const sc = .7 + t.depth * .5;
    const th = t.h * h * sc;
    const px = t.x * w;
    const baseY = h + h * .02 * (t.depth - .5);
    dPine(cx, px, baseY, th, t.layers, t.dk * .6, w);
  });
  cx.fillStyle = fogG;
  cx.fillRect(0, h * .82, w, h * .18);
}

function dTreesDay(cx, w, h) {
  // Ground
  const gg = cx.createLinearGradient(0, h * .7, 0, h);
  gg.addColorStop(0, '#5a8840'); gg.addColorStop(1, '#3a6025');
  cx.fillStyle = gg; cx.fillRect(0, h * .68, w, h * .32);
  // Pine trees in daylight
  PINES.forEach(t => {
    const sc = .5 + t.depth * .7;
    const th = t.h * h * sc;
    const px = t.x * w;
    const baseY = h * .7 + t.depth * h * .12;
    const trunkW = th * .025;
    const trunkH = th * .3;
    // Trunk
    cx.fillStyle = '#5a3820';
    cx.fillRect(px - trunkW / 2, baseY - trunkH, trunkW, trunkH);
    // Green branch layers
    const greens = ['#2a6828', '#3a8830', '#4a9838', '#3a7828', '#5aaa40'];
    for (let i = 0; i < t.layers; i++) {
      const frac = i / t.layers;
      const layerY = baseY - th + th * .15 + frac * th * .55;
      const layerW = th * (.12 + frac * .32);
      const layerH = th * (.2 + frac * .08);
      cx.fillStyle = greens[(Math.floor(t.x * 10) + i) % greens.length];
      cx.beginPath();
      cx.moveTo(px, layerY - layerH * .3);
      cx.lineTo(px - layerW, layerY + layerH);
      cx.lineTo(px + layerW, layerY + layerH);
      cx.closePath();
      cx.fill();
    }
  });
}

function dRain(cx, w, h) {
  cx.strokeStyle = 'rgba(160,200,240,.42)'; cx.lineWidth = .8;
  RDPS.forEach(function (d) {
    cx.globalAlpha = d.o; cx.beginPath();
    const rx = d.x % (w + 100), ry = d.y % (h + 50);
    cx.moveTo(rx, ry); cx.lineTo(rx - 1, ry + d.l); cx.stroke();
    d.y += d.s; d.x -= .5;
    if (d.y > h + 50) { d.y = -20; d.x = Math.random() * (w + 100); }
  });
  cx.globalAlpha = 1;
}

// --- Background definitions ---
const BG_DEFS = {
  city(cx, w, h) {
    const g = cx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a1828'); g.addColorStop(.55, '#182840'); g.addColorStop(1, '#14203a');
    cx.fillStyle = g; cx.fillRect(0, 0, w, h); dStars(cx, w, h); dMoon(cx, w, h, .78, .12); dBlds(cx, w, h, '#080c14', 'rgba(255,215,115,.62)');
  },
  rain(cx, w, h) {
    const g = cx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b0e18'); g.addColorStop(1, '#12141e');
    cx.fillStyle = g; cx.fillRect(0, 0, w, h); dBlds(cx, w, h, '#090b12', 'rgba(185,195,235,.35)'); dRain(cx, w, h);
  },
  forest(cx, w, h) {
    const g = cx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#010804'); g.addColorStop(.65, '#040e06'); g.addColorStop(1, '#061205');
    cx.fillStyle = g; cx.fillRect(0, 0, w, h); dStars(cx, w, h); dMoon(cx, w, h, .74, .11); dTrees(cx, w, h);
  },
  forestday(cx, w, h) {
    const g = cx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a8ec8'); g.addColorStop(.45, '#7aaad8'); g.addColorStop(.75, '#a8c88a'); g.addColorStop(1, '#6a9850');
    cx.fillStyle = g; cx.fillRect(0, 0, w, h);
    for (let ci = 0; ci < 5; ci++) {
      const cx2 = w * (.12 + ci * .18), cy2 = h * (.08 + Math.sin(ci * 1.7) * .06), cr = h * .055 + ci % 3 * h * .02;
      const cg = cx.createRadialGradient(cx2, cy2, 0, cx2, cy2, cr); cg.addColorStop(0, 'rgba(255,255,255,.82)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
      cx.fillStyle = cg; cx.beginPath(); cx.ellipse(cx2, cy2, cr * 1.6, cr, 0, 0, 6.28); cx.fill();
    }
    const sg = cx.createRadialGradient(w * .72, h * .1, 0, w * .72, h * .1, h * .1);
    sg.addColorStop(0, 'rgba(255,255,180,.95)'); sg.addColorStop(.4, 'rgba(255,230,80,.6)'); sg.addColorStop(1, 'rgba(255,200,0,0)');
    cx.fillStyle = sg; cx.fillRect(0, 0, w, h);
    cx.beginPath(); cx.arc(w * .72, h * .1, h * .038, 0, 6.28); cx.fillStyle = 'rgba(255,252,180,.95)'; cx.fill();
    dTreesDay(cx, w, h);
  },
  beach(cx, w, h) {
    const sky = cx.createLinearGradient(0, 0, 0, h * .55); sky.addColorStop(0, '#2858a8'); sky.addColorStop(.5, '#4a88cc'); sky.addColorStop(1, '#7ab8e8');
    cx.fillStyle = sky; cx.fillRect(0, 0, w, h * .55);
    const sg = cx.createRadialGradient(w * .55, h * .5, 0, w * .55, h * .5, h * .12);
    sg.addColorStop(0, 'rgba(255,252,200,.9)'); sg.addColorStop(.3, 'rgba(255,220,100,.5)'); sg.addColorStop(1, 'rgba(255,180,0,0)');
    cx.fillStyle = sg; cx.fillRect(0, 0, w, h * .55);
    cx.beginPath(); cx.arc(w * .55, h * .5, h * .032, 0, 6.28); cx.fillStyle = 'rgba(255,255,210,.98)'; cx.fill();
    const ocean = cx.createLinearGradient(0, h * .55, 0, h * .75); ocean.addColorStop(0, '#1a5888'); ocean.addColorStop(.5, '#226699'); ocean.addColorStop(1, '#2a78aa');
    cx.fillStyle = ocean; cx.fillRect(0, h * .52, w, h * .23);
    for (let wi = 0; wi < 6; wi++) {
      const wy = h * (.57 + wi * .022);
      cx.beginPath(); cx.moveTo(0, wy);
      for (let wx = 0; wx <= w; wx += w / 20) cx.quadraticCurveTo(wx + w / 40, wy - h * .006, wx + w / 20, wy);
      cx.strokeStyle = 'rgba(255,255,255,' + (0.12 + wi * .04) + ')'; cx.lineWidth = 1.5 + wi * .4; cx.stroke();
    }
    const shimmer = cx.createLinearGradient(0, h * .52, 0, h * .75);
    shimmer.addColorStop(0, 'rgba(255,255,255,.08)'); shimmer.addColorStop(.5, 'rgba(255,255,255,0)'); shimmer.addColorStop(1, 'rgba(255,255,255,.04)');
    cx.fillStyle = shimmer; cx.fillRect(0, h * .52, w, h * .23);
    const sand = cx.createLinearGradient(0, h * .75, 0, h); sand.addColorStop(0, '#d4b878'); sand.addColorStop(.4, '#c8a858'); sand.addColorStop(1, '#b89040');
    cx.fillStyle = sand; cx.fillRect(0, h * .74, w, h * .26);
    cx.fillStyle = 'rgba(180,150,80,.25)';
    for (let si = 0; si < 120; si++) cx.fillRect(Math.random() * w, h * .76 + Math.random() * h * .22, 1 + Math.random() * 2, 1);
    for (let pi = 0; pi < 4; pi++) {
      const px = w * (.08 + pi * .26), py = h * .74;
      cx.fillStyle = '#1a1008'; cx.beginPath(); cx.moveTo(px, py); cx.lineTo(px + 5, py - h * .18); cx.lineTo(px - 2, py - h * .15); cx.closePath(); cx.fill();
      for (let pli = 0; pli < 5; pli++) {
        const pa = (pli / 5) * 3.14 - 1.5;
        cx.beginPath(); cx.moveTo(px + 3, py - h * .18);
        cx.quadraticCurveTo(px + 3 + Math.cos(pa) * w * .06, py - h * .18 + Math.sin(pa) * h * .06, px + 3 + Math.cos(pa) * w * .1, py - h * .18 + Math.sin(pa) * h * .1);
        cx.lineWidth = 3; cx.strokeStyle = '#1a1008'; cx.stroke();
      }
    }
  },
  sunset(cx, w, h) {
    const g = cx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#090408'); g.addColorStop(.25, '#3a1108'); g.addColorStop(.62, '#782e0e'); g.addColorStop(1, '#280e05');
    cx.fillStyle = g; cx.fillRect(0, 0, w, h);
    const sg = cx.createRadialGradient(w * .62, h * .45, 0, w * .62, h * .45, h * .2);
    sg.addColorStop(0, 'rgba(255,165,58,.62)'); sg.addColorStop(1, 'rgba(255,75,0,0)');
    cx.fillStyle = sg; cx.fillRect(0, 0, w, h); dBlds(cx, w, h, '#160705', 'rgba(255,175,75,.52)');
  },
  space(cx, w, h) {
    cx.fillStyle = '#000006'; cx.fillRect(0, 0, w, h);
    const n1 = cx.createRadialGradient(w * .28, h * .18, 0, w * .28, h * .18, h * .28);
    n1.addColorStop(0, 'rgba(78,38,118,.32)'); n1.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = n1; cx.fillRect(0, 0, w, h);
    const n2 = cx.createRadialGradient(w * .72, h * .1, 0, w * .72, h * .1, h * .22);
    n2.addColorStop(0, 'rgba(38,78,138,.26)'); n2.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = n2; cx.fillRect(0, 0, w, h); dStars(cx, w, h); dMoon(cx, w, h, .8, .13);
  },
  morning(cx, w, h) {
    const g = cx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#182848'); g.addColorStop(.4, '#486888'); g.addColorStop(.78, '#c8a058'); g.addColorStop(1, '#e0b055');
    cx.fillStyle = g; cx.fillRect(0, 0, w, h);
    const sg = cx.createRadialGradient(w * .5, h * .55, 0, w * .5, h * .55, h * .15);
    sg.addColorStop(0, 'rgba(255,248,175,.95)'); sg.addColorStop(.4, 'rgba(255,198,78,.52)'); sg.addColorStop(1, 'rgba(255,148,0,0)');
    cx.fillStyle = sg; cx.fillRect(0, 0, w, h); dBlds(cx, w, h, '#181005', 'rgba(255,218,138,.55)');
  }
};

export function drawBg() {
  const w = bgCv.width, h = bgCv.height;
  bgCx.clearRect(0, 0, w, h);
  const fn = BG_DEFS[curBg];
  if (fn) fn(bgCx, w, h);
  bgFr++;
}

export const BG_LIST = [
  { id: 'city',      name: '深夜城市', c1: '#0a1828', c2: '#182840' },
  { id: 'rain',      name: '雨夜',     c1: '#0b0e18', c2: '#12141e' },
  { id: 'forest',    name: '森林夜晚', c1: '#010804', c2: '#061205' },
  { id: 'forestday', name: '森林白天', c1: '#5a8ec8', c2: '#6a9850' },
  { id: 'beach',     name: '海边风景', c1: '#2858a8', c2: '#d4b878' },
  { id: 'sunset',    name: '黄昏晚霞', c1: '#3a1108', c2: '#782e0e' },
  { id: 'space',     name: '深空星云', c1: '#000006', c2: '#080816' },
  { id: 'morning',   name: '清晨破晓', c1: '#182848', c2: '#c8a058' },
];
