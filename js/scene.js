// ============================================================
// THREE.JS SCENE — renderer, camera, room geometry, lighting
// ============================================================
/* global THREE */

let W = innerWidth, H = innerHeight;

export const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c3d'), antialias: true, alpha: true });
renderer.setSize(W, H);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setClearColor(0x000000, 0);

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(48, W / H, .1, 80);
camera.position.set(0, 5.5, 12);
camera.lookAt(0, 2, 0);

// --- Helpers ---
export function mat(col, ro, me, ex) {
  const o = { color: col, roughness: ro === undefined ? .8 : ro, metalness: me === undefined ? 0 : me };
  if (ex) Object.assign(o, ex);
  return new THREE.MeshStandardMaterial(o);
}

export function mk(geo, m, px, py, pz, rx, ry, rz, sh) {
  const mesh = new THREE.Mesh(geo, m);
  if (px !== undefined) mesh.position.set(px, py || 0, pz || 0);
  if (rx !== undefined) mesh.rotation.set(rx, ry || 0, rz || 0);
  if (sh) mesh.castShadow = true;
  return mesh;
}

// --- Room constants ---
const FLOOR_Y = -1.4, BACK_Z = -5.5, CEIL_Y = 8.6, ROOM_W = 18;
const WIN_X0 = -4.0, WIN_X1 = 4.0, WIN_Y0 = 1.2, WIN_Y1 = 7.2;

const wallMat  = mat(0x1e1510, .95, 0);
const wallMat2 = mat(0x1a120d, .96, 0);
const floorMat = mat(0x0e0a06, .88, .02);
const ceilMat  = mat(0x141008, .97, 0);

// --- Floor & Ceiling ---
const floor = mk(new THREE.PlaneGeometry(ROOM_W, 20), floorMat, 0, FLOOR_Y, 0, -Math.PI / 2, 0, 0);
floor.receiveShadow = true; scene.add(floor);
scene.add(mk(new THREE.PlaneGeometry(ROOM_W, 20), ceilMat, 0, CEIL_Y, 0, Math.PI / 2, 0, 0));

// --- Side walls ---
const sideWallGeo = new THREE.PlaneGeometry(20, CEIL_Y - FLOOR_Y);
const sideWallL = mk(sideWallGeo, wallMat2, -9, (FLOOR_Y + CEIL_Y) / 2, 2, 0, Math.PI / 2, 0);
sideWallL.receiveShadow = true; scene.add(sideWallL);
const sideWallR = mk(sideWallGeo.clone(), wallMat2, 9, (FLOOR_Y + CEIL_Y) / 2, 2, 0, -Math.PI / 2, 0);
sideWallR.receiveShadow = true; scene.add(sideWallR);

// --- Back wall (4 pieces around window) ---
const bwBotH = WIN_Y0 - FLOOR_Y;
const bwBot = mk(new THREE.PlaneGeometry(ROOM_W, bwBotH), wallMat, 0, FLOOR_Y + bwBotH / 2, BACK_Z);
bwBot.receiveShadow = true; scene.add(bwBot);
const bwTopH = CEIL_Y - WIN_Y1;
const bwTop = mk(new THREE.PlaneGeometry(ROOM_W, bwTopH), wallMat, 0, WIN_Y1 + bwTopH / 2, BACK_Z);
bwTop.receiveShadow = true; scene.add(bwTop);
const bwLW = WIN_X0 - (-9), bwMidH = WIN_Y1 - WIN_Y0;
const bwL = mk(new THREE.PlaneGeometry(bwLW, bwMidH), wallMat, -9 + bwLW / 2, WIN_Y0 + bwMidH / 2, BACK_Z);
bwL.receiveShadow = true; scene.add(bwL);
const bwRW = 9 - WIN_X1;
const bwR = mk(new THREE.PlaneGeometry(bwRW, bwMidH), wallMat, WIN_X1 + bwRW / 2, WIN_Y0 + bwMidH / 2, BACK_Z);
bwR.receiveShadow = true; scene.add(bwR);

// --- Window frame ---
const wfMat = mat(0x2a1a0c, .75, .08), wfThk = 0.12;
scene.add(mk(new THREE.BoxGeometry(WIN_X1 - WIN_X0 + wfThk * 2, wfThk, wfThk * 1.5), wfMat, 0, WIN_Y1 + wfThk / 2, BACK_Z + wfThk * .5));
scene.add(mk(new THREE.BoxGeometry(WIN_X1 - WIN_X0 + wfThk * 2, wfThk, wfThk * 1.5), wfMat, 0, WIN_Y0 - wfThk / 2, BACK_Z + wfThk * .5));
scene.add(mk(new THREE.BoxGeometry(wfThk, WIN_Y1 - WIN_Y0 + wfThk * 2, wfThk * 1.5), wfMat, WIN_X0 - wfThk / 2, (WIN_Y0 + WIN_Y1) / 2, BACK_Z + wfThk * .5));
scene.add(mk(new THREE.BoxGeometry(wfThk, WIN_Y1 - WIN_Y0 + wfThk * 2, wfThk * 1.5), wfMat, WIN_X1 + wfThk / 2, (WIN_Y0 + WIN_Y1) / 2, BACK_Z + wfThk * .5));
scene.add(mk(new THREE.BoxGeometry(wfThk * .7, WIN_Y1 - WIN_Y0, wfThk), wfMat, 0, (WIN_Y0 + WIN_Y1) / 2, BACK_Z + wfThk * .4));
scene.add(mk(new THREE.BoxGeometry(WIN_X1 - WIN_X0, wfThk * .7, wfThk), wfMat, 0, (WIN_Y0 + WIN_Y1) / 2 + .4, BACK_Z + wfThk * .4));

// Window glass
const glassMat = mat(0x88aacc, .05, .15, { transparent: true, opacity: .12 });
scene.add(mk(new THREE.PlaneGeometry(WIN_X1 - WIN_X0, WIN_Y1 - WIN_Y0), glassMat, 0, (WIN_Y0 + WIN_Y1) / 2, BACK_Z + .01));
// Window sill
scene.add(mk(new THREE.BoxGeometry(WIN_X1 - WIN_X0 + wfThk * 4, wfThk * 1.2, .4), mat(0x3a2810, .72, .06), 0, WIN_Y0 - wfThk * .6, BACK_Z + .2));

// --- Baseboard trim ---
const trimMat = mat(0x3a2810, .78, .05);
scene.add(mk(new THREE.BoxGeometry(ROOM_W, .18, .08), trimMat, 0, FLOOR_Y + .09, BACK_Z + .04));
scene.add(mk(new THREE.BoxGeometry(.08, .18, 20), trimMat, -9 + .04, FLOOR_Y + .09, 2));
scene.add(mk(new THREE.BoxGeometry(.08, .18, 20), trimMat, 9 - .04, FLOOR_Y + .09, 2));

// --- Ceiling pendant: Noguchi-style paper lantern ---
const pendantX = 0, pendantZ = -1;
const lanternY = CEIL_Y - 2.2;
const lanternR = .7;
// Ceiling canopy
scene.add(mk(new THREE.CylinderGeometry(.15, .15, .04, 16), mat(0x2a2018, .6, .5), pendantX, CEIL_Y - .02, pendantZ));
// Cord
scene.add(mk(new THREE.CylinderGeometry(.008, .008, CEIL_Y - lanternY - lanternR, 8), mat(0x1a1008, .9, .1), pendantX, (CEIL_Y + lanternY + lanternR) / 2, pendantZ));
// Paper globe — translucent warm white sphere
export const paperMat = mat(0xfff8e8, .95, 0, { side: THREE.DoubleSide, transparent: true, opacity: .72, emissive: new THREE.Color(0xfff4cc), emissiveIntensity: 0 });
const globe = mk(new THREE.SphereGeometry(lanternR, 32, 24), paperMat, pendantX, lanternY, pendantZ);
globe.castShadow = true; scene.add(globe);
// Wire ribs — horizontal rings around the sphere
const ribMat = mat(0x8a7050, .6, .2);
for (let i = 1; i < 8; i++) {
  const frac = i / 8;
  const angle = frac * Math.PI;
  const ribR = lanternR * Math.sin(angle) + .005;
  const ribY = lanternY - lanternR * Math.cos(angle);
  const rib = new THREE.Mesh(new THREE.TorusGeometry(ribR, .008, 6, 40), ribMat);
  rib.rotation.x = Math.PI / 2;
  rib.position.set(pendantX, ribY, pendantZ);
  scene.add(rib);
}
// Two vertical wire ribs (cross shape)
for (let a = 0; a < 2; a++) {
  const vrib = new THREE.Mesh(new THREE.TorusGeometry(lanternR + .005, .007, 6, 40), ribMat);
  vrib.position.set(pendantX, lanternY, pendantZ);
  vrib.rotation.y = a * Math.PI / 2;
  scene.add(vrib);
}
// Top and bottom metal caps
const capMat = mat(0x3a3020, .5, .4);
scene.add(mk(new THREE.CylinderGeometry(.1, .12, .06, 16), capMat, pendantX, lanternY + lanternR - .01, pendantZ));
scene.add(mk(new THREE.CylinderGeometry(.12, .1, .06, 16), capMat, pendantX, lanternY - lanternR + .01, pendantZ));
// Bulb inside — barely visible, just a soft glow source
export const fixtureMat = mat(0xfff8e0, .5, 0, { emissive: new THREE.Color(0xfff4cc), emissiveIntensity: 0, transparent: true, opacity: .15 });
scene.add(mk(new THREE.SphereGeometry(.06, 8, 6), fixtureMat, pendantX, lanternY, pendantZ));
// Inner glow sphere — larger, very transparent, creates center-bright halo effect
export const lanternGlowMat = mat(0xfff4cc, .5, 0, { emissive: new THREE.Color(0xfff0bb), emissiveIntensity: 0, transparent: true, opacity: 0, depthWrite: false, side: THREE.BackSide });
scene.add(mk(new THREE.SphereGeometry(lanternR * .6, 20, 16), lanternGlowMat, pendantX, lanternY, pendantZ));

export const ceilLight = new THREE.PointLight(0xfff4dd, 0, 20);
ceilLight.position.set(pendantX, lanternY, pendantZ); ceilLight.castShadow = false; scene.add(ceilLight);
export const ceilSpot = new THREE.SpotLight(0xfff4dd, 0, 16, Math.PI / 3.5, .6, 1.5);
ceilSpot.position.set(pendantX, lanternY, pendantZ);
ceilSpot.target.position.set(pendantX, 0, pendantZ);
scene.add(ceilSpot); scene.add(ceilSpot.target);

// --- Desk ---
const deskG = new THREE.Group(); scene.add(deskG);
const dtm = mat(0x4a2e16, .72, .03), dsm = mat(0x3a2210, .85, .02);
const dtop = new THREE.Mesh(new THREE.BoxGeometry(14, .24, 6), [dsm, dsm, dtm, dsm, dsm, dsm]);
dtop.receiveShadow = true; dtop.castShadow = true; deskG.add(dtop);
deskG.add(mk(new THREE.BoxGeometry(14, .07, .09), mat(0x8a6030, .6, .1), 0, .055, 3));
const legM = mat(0x2a1808, .88, .04);
[[-5.8, -1.75, -2.5], [5.8, -1.75, -2.5], [-5.8, -1.75, 2.5], [5.8, -1.75, 2.5]].forEach(function (p) {
  deskG.add(mk(new THREE.BoxGeometry(.22, 3.5, .22), legM, p[0], p[1], p[2], 0, 0, 0, true));
});
// Side stretchers between legs (front pair and back pair) — positioned between legs, not through floor
deskG.add(mk(new THREE.BoxGeometry(.14, .14, 4.78), legM, -5.8, -1.2, 0));
deskG.add(mk(new THREE.BoxGeometry(.14, .14, 4.78), legM, 5.8, -1.2, 0));
deskG.position.set(0, 1.75, .5);
export const SURF = deskG.position.y + .12;
export const DPLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -SURF);

// --- Lighting ---
const hemi = new THREE.HemisphereLight(0xfff0dd, 0x223366, .5); scene.add(hemi);
const fill = new THREE.DirectionalLight(0xfff8ee, .65);
fill.position.set(2, 9, 5); fill.castShadow = true;
fill.shadow.mapSize.set(1024, 1024);
fill.shadow.camera.left = -10; fill.shadow.camera.right = 10;
fill.shadow.camera.top = 8; fill.shadow.camera.bottom = -2;
fill.shadow.camera.near = 1; fill.shadow.camera.far = 20;
scene.add(fill);
export const winLight = new THREE.DirectionalLight(0x8aabcc, .35);
winLight.position.set(0, 5, -4); scene.add(winLight);
const df = new THREE.PointLight(0xfff4e0, .4, 14); df.position.set(0, SURF + 2, .5); df.castShadow = false; scene.add(df);
const df2 = new THREE.PointLight(0xffeecc, .22, 10); df2.position.set(-3, SURF + 1.5, -.5); df2.castShadow = false; scene.add(df2);

export const BLIGHTS = [hemi, fill, winLight, df, df2, ceilLight, ceilSpot];
export const BBASE = [.5, .65, .35, .4, .22, 0, 0];

export function applyBr(v) {
  const f = .1 + v / 100 * 1.9;
  BLIGHTS.forEach(function (l, i) { l.intensity = BBASE[i] * f; });
  renderer.toneMappingExposure = .55 + f * .45;
}
applyBr(50);

// --- 3D Rain particles ---
const rGeo = new THREE.BufferGeometry();
const rPA = new Float32Array(1200 * 3);
for (let i = 0; i < 1200; i++) { rPA[i * 3] = (Math.random() - .5) * 30; rPA[i * 3 + 1] = Math.random() * 20 - 2; rPA[i * 3 + 2] = (Math.random() - .5) * 16; }
rGeo.setAttribute('position', new THREE.BufferAttribute(rPA, 3));
export const rPts = new THREE.Points(rGeo, new THREE.PointsMaterial({ color: 0x99bbdd, size: .045, transparent: true, opacity: .5 }));
rPts.visible = false; scene.add(rPts);

// --- Resize handler ---
export function onResize() {
  W = innerWidth; H = innerHeight;
  renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix();
}

// --- Camera orbit ---
let camT = 0, camP = .36, camR = 12;
export function updCam() {
  camera.position.set(camR * Math.sin(camT) * Math.cos(camP), 2 + camR * Math.sin(camP), camR * Math.cos(camT) * Math.cos(camP));
  camera.lookAt(0, 2, 0);
}
export function getCam() { return { camT, camP, camR }; }
export function setCam(t, p, r) { if (t !== undefined) camT = t; if (p !== undefined) camP = p; if (r !== undefined) camR = r; }
updCam();
