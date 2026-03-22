// ============================================================
// ITEM FACTORY FUNCTIONS — each returns a THREE.Group
// ============================================================
/* global THREE */
import { mat, mk } from './scene.js';

const BM = mat(0xb8860b, .3, .82);
const CM = mat(0xf2ede2, .38, .06);

// --- GLB model loader helper ---
const glbLoader = new THREE.GLTFLoader();
// Callback set by items-registry to re-collect meshes after async load
let _onGLBReady = null;
export function setOnGLBReady(fn) { _onGLBReady = fn; }

export function loadGLBModel(path, scale, onLoad) {
  const g = new THREE.Group();
  glbLoader.load(path, (gltf) => {
    const model = gltf.scene;
    model.scale.setScalar(scale);
    // Auto-center the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));
    // Enable shadows
    model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
    g.add(model);
    g.userData.model = model;
    // Play animations if available
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach(clip => { mixer.clipAction(clip).play(); });
      g.userData.mixer = mixer;
    }
    if (onLoad) onLoad(g, gltf);
    // Re-collect meshes so raycasting works for drag
    if (_onGLBReady) _onGLBReady();
  });
  return g;
}

export function makeLamp() {
  const g = new THREE.Group();
  g.add(mk(new THREE.CylinderGeometry(.38, .44, .09, 28), BM, 0, .045, 0));
  g.add(mk(new THREE.CylinderGeometry(.28, .38, .06, 24), BM, 0, .09, 0));
  g.add(mk(new THREE.CylinderGeometry(.045, .045, 2, 14), BM, 0, 1.1, 0, 0, 0, 0, true));
  const arm = mk(new THREE.CylinderGeometry(.038, .038, .55, 10), BM, .28, 2.05, 0);
  arm.rotation.z = Math.PI / 2.3; g.add(arm);
  const sm = mat(0xcc8822, .68, .12, { side: THREE.DoubleSide });
  // Shade opens downward — ConeGeometry tip at top, base at bottom by default
  const shade = mk(new THREE.ConeGeometry(.56, .62, 28, 1, true), sm, .42, 2.22, 0, 0, 0, 0, true);
  g.add(shade);
  const si = mk(new THREE.ConeGeometry(.54, .6, 28, 1, true),
    mat(0x4a2a10, .85, 0, { side: THREE.FrontSide }), .42, 2.22, 0);
  g.add(si);
  const bm = mat(0xffee88, .4, 0, { emissive: new THREE.Color(0xffee44), emissiveIntensity: 0 });
  g.add(mk(new THREE.SphereGeometry(.08, 12, 8), bm, .42, 2.02, 0));
  const pt = new THREE.PointLight(0xffcc55, 0, 12);
  pt.position.set(.42, 2.1, 0); pt.castShadow = true; pt.shadow.mapSize.set(2048, 2048); g.add(pt);
  const sp = new THREE.SpotLight(0xffcc55, 0, 12, Math.PI / 3.5, .55, 1.8);
  sp.position.set(.42, 2.2, 0);
  const st = new THREE.Object3D(); st.position.set(1, -1, 0); g.add(st); sp.target = st; g.add(sp);
  g.userData.pt = pt; g.userData.sp = sp; g.userData.bm = bm;
  return g;
}

export function makePlayer() {
  const g = new THREE.Group();
  g.add(mk(new THREE.BoxGeometry(2.4, .5, 1.8), mat(0x1c1c1c, .3, .5), 0, 0, 0, 0, 0, 0, true));
  g.add(mk(new THREE.BoxGeometry(2.36, .045, 1.76), mat(0x282828, .15, .7), 0, .27, 0));
  g.add(mk(new THREE.CylinderGeometry(.62, .62, .025, 40), mat(0x141414, .5, .4), -.3, .285, .1));
  const disc = mk(new THREE.CylinderGeometry(.6, .6, .055, 44), mat(0x111111, .2, .5), -.3, .31, .1, 0, 0, 0, true);
  g.add(disc);
  for (let ri = 0; ri < 8; ri++) {
    const rg = mk(new THREE.TorusGeometry(.1 + ri * .058, .0035, 4, 44), mat(0x1a1a1a, .35, .55), -.3, .338, .1);
    rg.rotation.x = Math.PI / 2; g.add(rg);
  }
  const lbm = mat(0xcc1111, .45, .2, { emissive: new THREE.Color(0x330000), emissiveIntensity: .4 });
  const lbl = mk(new THREE.CylinderGeometry(.13, .13, .057, 20), lbm, -.3, .312, .1); g.add(lbl);
  g.add(mk(new THREE.CylinderGeometry(.018, .018, .12, 10), mat(0x666666, .3, .8), -.3, .345, .1));
  const chm = mat(0x999999, .2, .85);
  g.add(mk(new THREE.CylinderGeometry(.07, .07, .1, 14), chm, .82, .33, -.42));
  const taG = new THREE.Group();
  const taS = mk(new THREE.CylinderGeometry(.025, .025, .85, 10), chm, -.42, 0, 0);
  taS.rotation.z = Math.PI / 2; taG.add(taS);
  taG.add(mk(new THREE.BoxGeometry(.12, .03, .07), mat(0xaaaaaa, .25, .75), -.88, 0, 0));
  taG.position.set(.82, .38, -.42); taG.rotation.y = Math.PI / 6; g.add(taG);
  g.add(mk(new THREE.CylinderGeometry(.075, .082, .09, 16), mat(0x333333, .35, .55), .82, .295, .5));
  g.add(mk(new THREE.BoxGeometry(.7, .36, .05), mat(0x252525, .95, .05), .82, 0, .88));
  const ldm = mat(0x00ff44, .5, 0, { emissive: new THREE.Color(0x00aa22), emissiveIntensity: 0 });
  g.add(mk(new THREE.SphereGeometry(.025, 8, 6), ldm, .82, .275, .78));
  [-1, 1].forEach(s => { [-1, 1].forEach(s2 => {
    g.add(mk(new THREE.CylinderGeometry(.05, .06, .06, 10), mat(0x111111, .95), s * .9, -.28, s2 * .7));
  }); });
  g.userData.disc = disc; g.userData.lbl = lbl; g.userData.ta = taG; g.userData.ldm = ldm;
  return g;
}

export function makeCandle(h) {
  const g = new THREE.Group();
  g.add(mk(new THREE.CylinderGeometry(.18, .15, .06, 20), mat(0xc8a040, .45, .72), 0, .03, 0));
  g.add(mk(new THREE.CylinderGeometry(.09, .095, h, 18), mat(0xfff0d0, .82, 0), 0, h / 2 + .06, 0, 0, 0, 0, true));
  g.add(mk(new THREE.CylinderGeometry(.088, .088, .015, 18), mat(0xffe8c0, .85, 0), 0, h + .06, 0));
  g.add(mk(new THREE.CylinderGeometry(.006, .006, .05, 6), mat(0x222222, .95), 0, h + .085, 0));
  const fg = new THREE.Group(); fg.position.y = h + .115;
  // Outer flame — larger, very transparent for soft edge
  fg.add(mk(new THREE.ConeGeometry(.05, .24, 12), mat(0xff6600, .95, 0, { emissive: new THREE.Color(0xff4400), emissiveIntensity: 2, transparent: true, opacity: .3, depthWrite: false }), 0, .11, 0));
  // Main flame
  fg.add(mk(new THREE.ConeGeometry(.035, .18, 10), mat(0xff7700, .95, 0, { emissive: new THREE.Color(0xff5500), emissiveIntensity: 3, transparent: true, opacity: .6, depthWrite: false }), 0, .1, 0));
  // Inner bright core
  fg.add(mk(new THREE.ConeGeometry(.016, .1, 8), mat(0xffee88, .95, 0, { emissive: new THREE.Color(0xffffff), emissiveIntensity: 5, transparent: true, opacity: .8, depthWrite: false }), 0, .065, 0));
  fg.visible = false; g.add(fg);
  const cl = new THREE.PointLight(0xff9933, 0, 5.5); cl.position.y = h + .22; cl.castShadow = false; g.add(cl);
  g.userData.fg = fg; g.userData.cl = cl;
  return g;
}

export function makePlant(sc) {
  sc = sc || 1; const g = new THREE.Group();
  // Pot — terracotta with slight texture
  const potMat = mat(0xb85c30, .78, .04);
  g.add(mk(new THREE.CylinderGeometry(.24 * sc, .18 * sc, .38 * sc, 22), potMat, 0, .19 * sc, 0, 0, 0, 0, true));
  // Pot rim
  const rim = mk(new THREE.TorusGeometry(.24 * sc, .025 * sc, 8, 22), mat(0xc86838, .72, .05), 0, .38 * sc, 0);
  rim.rotation.x = Math.PI / 2; g.add(rim);
  // Soil — bumpy surface, slightly smaller to avoid clipping with pot wall
  const soilGeo = new THREE.SphereGeometry(.21 * sc, 16, 8, 0, 6.28, 0, Math.PI / 2);
  const soilPos = soilGeo.attributes.position;
  for (let i = 0; i < soilPos.count; i++) {
    const y = soilPos.getY(i);
    if (y > .01) soilPos.setY(i, y * .25 + (Math.random() - .5) * .015 * sc);
  }
  soilGeo.computeVertexNormals();
  const soil = new THREE.Mesh(soilGeo, mat(0x2a1808, .95, 0));
  soil.position.y = .37 * sc;
  g.add(soil);
  // Main stem
  g.add(mk(new THREE.CylinderGeometry(.022 * sc, .03 * sc, .3 * sc, 8), mat(0x2a4820, .9), 0, .57 * sc, 0));
  // Leaves — original style
  const lc = [0x3a6e30, 0x4a8040, 0x2d5825, 0x5a9a4a, 0x326428];
  for (let li = 0; li < 7; li++) {
    const a = (li / 7) * 6.28, r = .26 * sc;
    const lg = new THREE.SphereGeometry(.22 * sc, 8, 5); lg.scale(1, .3, .65);
    const lf = mk(lg, mat(lc[li % 5], .88, 0, { side: THREE.DoubleSide }), 0, 0, 0, 0, 0, 0, true);
    lf.position.set(Math.cos(a) * r, .57 * sc + .14 * sc + Math.random() * .08 * sc, Math.sin(a) * r);
    lf.rotation.set(-.45 - Math.random() * .3, 0, a + .4); g.add(lf);
  }
  return g;
}

export function makeCup() {
  const g = new THREE.Group();
  g.add(mk(new THREE.CylinderGeometry(.4, .34, .065, 28), CM, 0, 0, 0, 0, 0, 0, true));
  const sr = mk(new THREE.TorusGeometry(.38, .018, 8, 32), CM, 0, .033, 0);
  sr.rotation.x = Math.PI / 2; g.add(sr);
  g.add(mk(new THREE.CylinderGeometry(.21, .165, .32, 24), CM, 0, .2, 0, 0, 0, 0, true));
  // Coffee surface with heart latte art
  const latteCv = document.createElement('canvas');
  latteCv.width = 128; latteCv.height = 128;
  const lx = latteCv.getContext('2d');
  // Deep coffee base
  lx.fillStyle = '#2a1206';
  lx.beginPath(); lx.arc(64, 64, 64, 0, 6.28); lx.fill();
  // Darker edge ring (crema shadow)
  const edgeG = lx.createRadialGradient(64, 64, 40, 64, 64, 62);
  edgeG.addColorStop(0, 'rgba(0,0,0,0)');
  edgeG.addColorStop(1, 'rgba(0,0,0,.3)');
  lx.fillStyle = edgeG;
  lx.beginPath(); lx.arc(64, 64, 62, 0, 6.28); lx.fill();
  // Thin crema ring
  lx.strokeStyle = '#5a3018';
  lx.lineWidth = 3;
  lx.beginPath(); lx.arc(64, 64, 52, 0, 6.28); lx.stroke();
  // Heart latte art — cream colored on dark coffee
  lx.save(); lx.translate(64, 64); lx.rotate(Math.PI * 1.5); lx.translate(-64, -64);
  // Milk pour base — soft radial blend where milk meets coffee
  const milkBase = lx.createRadialGradient(64, 54, 5, 64, 56, 28);
  milkBase.addColorStop(0, 'rgba(200,175,130,.35)');
  milkBase.addColorStop(1, 'rgba(200,175,130,0)');
  lx.fillStyle = milkBase;
  lx.fillRect(30, 30, 68, 50);
  // Heart shape — soft edges
  lx.fillStyle = '#c0a070';
  lx.globalAlpha = .55;
  lx.beginPath();
  lx.moveTo(64, 74);
  lx.quadraticCurveTo(42, 58, 46, 46);
  lx.quadraticCurveTo(50, 36, 64, 48);
  lx.quadraticCurveTo(78, 36, 82, 46);
  lx.quadraticCurveTo(86, 58, 64, 74);
  lx.fill();
  // Inner heart — lighter milk layer
  lx.fillStyle = '#d4b888';
  lx.globalAlpha = .4;
  lx.beginPath();
  lx.moveTo(64, 68);
  lx.quadraticCurveTo(50, 56, 52, 50);
  lx.quadraticCurveTo(55, 42, 64, 52);
  lx.quadraticCurveTo(73, 42, 76, 50);
  lx.quadraticCurveTo(78, 56, 64, 68);
  lx.fill();
  // Milk flow line from pour point through center of heart
  lx.strokeStyle = '#d8c098';
  lx.globalAlpha = .35;
  lx.lineWidth = 1.5;
  lx.beginPath();
  lx.moveTo(64, 38);
  lx.lineTo(64, 74);
  lx.stroke();
  // Feathered edges — tiny streaks radiating from heart
  lx.globalAlpha = .2;
  lx.lineWidth = 1;
  for (let fi = 0; fi < 8; fi++) {
    const fa = (fi / 8) * 6.28;
    const fr = 18 + Math.random() * 6;
    lx.beginPath();
    lx.moveTo(64 + Math.cos(fa) * 14, 56 + Math.sin(fa) * 12);
    lx.lineTo(64 + Math.cos(fa) * fr, 56 + Math.sin(fa) * (fr * .8));
    lx.stroke();
  }
  lx.globalAlpha = 1;
  lx.restore();
  const latteTex = new THREE.CanvasTexture(latteCv);
  const latteMat = new THREE.MeshStandardMaterial({ map: latteTex, roughness: .06, metalness: .04 });
  g.add(mk(new THREE.CylinderGeometry(.2, .2, .008, 24), latteMat, 0, .358, 0));
  // Handle
  const hdGeo = new THREE.TorusGeometry(.08, .02, 10, 20, Math.PI);
  const hd = new THREE.Mesh(hdGeo, CM);
  hd.rotation.set(0, 0, -Math.PI / 2);
  hd.position.set(.18, .20, 0);
  g.add(hd);
  // Steam wisps — thin rising curves, not bubble particles
  const steamGroup = new THREE.Group();
  steamGroup.position.set(0, .36, 0);
  const steamWisps = [];
  for (let wi = 0; wi < 6; wi++) {
    const pts = [];
    const segs = 8;
    for (let s = 0; s <= segs; s++) pts.push(new THREE.Vector3(0, s * .06, 0));
    const curve = new THREE.BufferGeometry().setFromPoints(pts);
    const wMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .3, depthWrite: false });
    const line = new THREE.Line(curve, wMat);
    line.position.set((Math.random() - .5) * .12, 0, (Math.random() - .5) * .12);
    steamGroup.add(line);
    steamWisps.push({ line, phase: Math.random() * 6.28, speed: .003 + Math.random() * .004, age: Math.random() });
  }
  g.add(steamGroup);
  g.userData.steamGroup = steamGroup;
  g.userData.steamWisps = steamWisps;
  return g;
}

export function makeNotebook() {
  const g = new THREE.Group();
  g.add(mk(new THREE.BoxGeometry(1.05, .065, 1.5), mat(0x1a3a22, .88, .04), 0, 0, 0, 0, 0, 0, true));
  g.add(mk(new THREE.BoxGeometry(.98, .058, 1.44), mat(0xf5f0e8, .92, 0), 0, .06, 0));
  g.add(mk(new THREE.BoxGeometry(.09, .12, 1.5), mat(0x8b5e3c, .72, .1), -.51, 0, 0));
  for (let ni = 0; ni < 6; ni++)
    g.add(mk(new THREE.BoxGeometry(.72, .003, .009), mat(0x99aacc, .9), .1, .092, -.5 + ni * .2));
  return g;
}

export function makeClock() {
  const g = new THREE.Group(), bc = mat(0xd4a030, .38, .72);
  // Face group — built flat then tilted upright
  const face = new THREE.Group();
  // Clock body
  face.add(mk(new THREE.CylinderGeometry(.38, .38, .13, 34), bc, 0, 0, 0, 0, 0, 0, true));
  // Dial face
  face.add(mk(new THREE.CylinderGeometry(.35, .35, .022, 34), mat(0xf5e8c0, .62, .04), 0, .076, 0));
  // Hour markers
  for (let ti = 0; ti < 12; ti++) {
    const ta = (ti / 12) * 6.28;
    face.add(mk(new THREE.BoxGeometry(.025, .005, ti % 3 === 0 ? .075 : .045), mat(0x3a2510, .9), Math.sin(ta) * .28, .09, Math.cos(ta) * .28));
  }
  // Hands
  const hH = mk(new THREE.BoxGeometry(.032, .006, .2), mat(0x1a0f05, .9), 0, .094, 0); face.add(hH);
  const mH = mk(new THREE.BoxGeometry(.022, .006, .27), mat(0x2a1808, .9), 0, .094, 0); face.add(mH);
  const sH = mk(new THREE.BoxGeometry(.013, .006, .3), mat(0xcc2222, .5, 0, { emissive: new THREE.Color(0x550000), emissiveIntensity: .4 }), 0, .094, 0); face.add(sH);
  // Center pin
  face.add(mk(new THREE.CylinderGeometry(.026, .026, .034, 14), bc, 0, .097, 0));
  // Tilt the face upright — rotate so dial faces +Z (toward camera)
  face.rotation.x = Math.PI / 2;
  face.position.y = .38;
  g.add(face);
  // Stand legs — V-shape support at the back (-Z side)
  [-1, 1].forEach(s => {
    const ft = mk(new THREE.BoxGeometry(.045, .42, .045), bc, s * .2, .16, -.15);
    ft.rotation.x = -.35;
    ft.rotation.z = s * .15;
    g.add(ft);
  });
  // Small base bar connecting legs
  g.add(mk(new THREE.BoxGeometry(.5, .04, .06), bc, 0, .02, -.22));
  g.userData.hH = hH; g.userData.mH = mH; g.userData.sH = sH;
  return g;
}

export function makeBooks() {
  const g = new THREE.Group(); let y = 0;
  const books = [
    { h: .28, w: .65, d: .9, c: 0x1e3a5a, r: .15 },
    { h: .34, w: .7, d: .95, c: 0x5a1a1a, r: -.08 },
    { h: .26, w: .6, d: .85, c: 0x1a4a2a, r: .2 },
  ];
  const pageMat = mat(0xf0e8d0, .95, 0);
  const pageEdgeMat = mat(0xe0d8c0, .92, 0);
  books.forEach((b, bi) => {
    const bookG = new THREE.Group();
    const coverMat = mat(b.c, .82, .05);
    const spineMat = mat(b.c, .7, .08);
    // Bottom cover
    bookG.add(mk(new THREE.BoxGeometry(b.w, .025, b.d), coverMat, 0, .013, 0, 0, 0, 0, true));
    // Top cover
    bookG.add(mk(new THREE.BoxGeometry(b.w, .025, b.d), coverMat, 0, b.h - .013, 0, 0, 0, 0, true));
    // Spine (back edge, -x side) — flat panel slightly thicker than cover
    bookG.add(mk(new THREE.BoxGeometry(.04, b.h + .005, b.d + .01), spineMat, -b.w / 2 + .01, b.h / 2, 0, 0, 0, 0, true));
    // Page block — cream, clearly visible between covers, slightly inset
    const pageH = b.h - .06;
    bookG.add(mk(new THREE.BoxGeometry(b.w - .06, pageH, b.d - .04), pageMat, .02, b.h / 2, 0));
    // Page edges visible on 3 open sides (+x front, +z, -z)
    // Front page edge (+x) — lots of thin lines for page look
    for (let pi = 0; pi < Math.floor(pageH / .018); pi++) {
      const py = .035 + pi * .018;
      bookG.add(mk(new THREE.BoxGeometry(.003, .001, b.d - .06), pageEdgeMat, b.w / 2 - .03, py, 0));
    }
    // Top/bottom edge color strip on covers
    const stripMat = mat(b.c, .6, .12);
    bookG.add(mk(new THREE.BoxGeometry(b.w + .01, .004, .02), stripMat, 0, b.h - .001, -b.d / 2 + .01));
    bookG.add(mk(new THREE.BoxGeometry(b.w + .01, .004, .02), stripMat, 0, b.h - .001, b.d / 2 - .01));
    bookG.position.y = y;
    bookG.rotation.y = b.r;
    g.add(bookG);
    y += b.h + .003;
  });
  return g;
}

export function makeGlasses() {
  const g = new THREE.Group();
  const gf = mat(0x1a1a1a, .35, .72);
  const gl = mat(0x88aacc, .05, .15, { transparent: true, opacity: .3 });
  // Glasses laid folded on desk — frame tilted up slightly like resting on nose bridge
  const frame = new THREE.Group();
  // Lens rims
  [-1, 1].forEach(s => {
    const fr = mk(new THREE.TorusGeometry(.13, .015, 8, 28), gf, s * .16, 0, 0);
    fr.rotation.x = Math.PI / 2; frame.add(fr);
    // Lens glass
    frame.add(mk(new THREE.CylinderGeometry(.12, .12, .01, 24), gl, s * .16, 0, 0));
  });
  // Nose bridge — curved
  const bridge = mk(new THREE.TorusGeometry(.04, .01, 6, 12, Math.PI), gf, 0, 0, .02);
  bridge.rotation.set(Math.PI / 2, 0, 0);
  frame.add(bridge);
  // Temples (arms) — folded inward, tucked alongside lenses
  [-1, 1].forEach(s => {
    // Hinge at outer edge of rim
    frame.add(mk(new THREE.BoxGeometry(.018, .014, .018), gf, s * .29, 0, 0));
    // Folded arm — folds inward along the frame (toward center, along x)
    frame.add(mk(new THREE.BoxGeometry(.3, .012, .012), gf, s * .14, 0, -.07));
    // Ear hook tip
    frame.add(mk(new THREE.BoxGeometry(.03, .012, .012), gf, s * -.01, -.004, -.07));
  });
  // Tilt the whole frame — resting upside down on lenses, slight angle
  frame.rotation.x = -.08;
  frame.position.y = .015;
  g.add(frame);
  return g;
}

export function makeTeapot() {
  const g = new THREE.Group(), tm = mat(0xcc8844, .35, .3);
  const bd = mk(new THREE.SphereGeometry(.28, 20, 14), tm, 0, 0, 0, 0, 0, 0, true);
  bd.scale.y = .85; g.add(bd);
  g.add(mk(new THREE.CylinderGeometry(.16, .18, .06, 18), tm, 0, .26, 0));
  g.add(mk(new THREE.SphereGeometry(.08, 12, 8), tm, 0, .34, 0));
  const sp2 = mk(new THREE.CylinderGeometry(.06, .04, .25, 10), tm, .34, 0, 0);
  sp2.rotation.z = -Math.PI / 4; g.add(sp2);
  const hn = mk(new THREE.TorusGeometry(.15, .035, 8, 16, Math.PI), tm, -.20, .05, 0);
  hn.rotation.set(0, 0, Math.PI / 2); g.add(hn);
  return g;
}

export function makeDigitalClock() {
  const g = new THREE.Group();
  const bodyM = mat(0x1a1a1a, .3, .5);
  // Main body — rounded box shape
  g.add(mk(new THREE.BoxGeometry(1.4, .7, .5), bodyM, 0, .35, 0, 0, 0, 0, true));
  // Top/bottom bevels
  g.add(mk(new THREE.BoxGeometry(1.36, .04, .46), mat(0x222222, .25, .6), 0, .695, 0));
  g.add(mk(new THREE.BoxGeometry(1.36, .04, .46), mat(0x222222, .25, .6), 0, .02, 0));
  // Screen bezel
  g.add(mk(new THREE.BoxGeometry(1.15, .48, .02), mat(0x0a0a0a, .15, .3), 0, .38, .26));
  // Screen — dark with emissive for the glow
  const screenMat = mat(0x001108, .2, .1, { emissive: new THREE.Color(0x003311), emissiveIntensity: .3 });
  const screen = mk(new THREE.BoxGeometry(1.08, .42, .01), screenMat, 0, .38, .27);
  g.add(screen);
  // We'll use a canvas texture for the time display
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 96;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const dispMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
  const disp = mk(new THREE.PlaneGeometry(1.0, .38), dispMat, 0, .38, .276);
  g.add(disp);
  // Small LED dot
  const ledMat = mat(0x00ff44, .5, 0, { emissive: new THREE.Color(0x00aa22), emissiveIntensity: 1.5 });
  g.add(mk(new THREE.SphereGeometry(.015, 8, 6), ledMat, .52, .2, .26));
  // Rubber feet
  [[-0.55, 0, -.18], [.55, 0, -.18], [-.55, 0, .18], [.55, 0, .18]].forEach(p => {
    g.add(mk(new THREE.CylinderGeometry(.04, .05, .03, 10), mat(0x333333, .9), p[0], p[1], p[2]));
  });
  g.userData.canvas = canvas;
  g.userData.ctx = ctx;
  g.userData.tex = tex;
  g.userData.ledMat = ledMat;
  return g;
}

// --- GLB desk pet ---
export function make9Cat() { return loadGLBModel('assets/3d_9cat.glb', .15); }

// --- Pomodoro 3D timer (tomato kitchen timer) ---
export function makePomodoro() {
  const g = new THREE.Group();
  // Canvas texture for the tomato body — time displayed directly on it
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 512;
  const ctx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv);
  const bodyMat = new THREE.MeshStandardMaterial({ map: tex, roughness: .72, metalness: .05, emissive: new THREE.Color(0x661111), emissiveIntensity: .3 });
  // Body — squashed sphere sitting on desk (Y starts at 0)
  const body = new THREE.Mesh(new THREE.SphereGeometry(.22, 24, 16), bodyMat);
  body.scale.y = .85;
  body.position.y = .16;
  body.castShadow = true;
  g.add(body);
  // Stem
  g.add(mk(new THREE.CylinderGeometry(.01, .014, .04, 6), mat(0x3a5a28, .85, 0), 0, .36, 0));
  // Leaves radiating from top
  const leafMat = mat(0x2a6820, .85, 0);
  for (let li = 0; li < 5; li++) {
    const a = (li / 5) * 6.28 + .3;
    const lr = .035 + Math.random() * .015;
    const leaf = mk(new THREE.SphereGeometry(lr, 6, 4), leafMat,
      Math.cos(a) * .07, .35, Math.sin(a) * .07);
    leaf.scale.set(1.8, .2, 1);
    leaf.rotation.y = a;
    leaf.rotation.z = .3;
    g.add(leaf);
  }
  g.userData.pomoCanvas = cv;
  g.userData.pomoCtx = ctx;
  g.userData.pomoTex = tex;
  return g;
}
