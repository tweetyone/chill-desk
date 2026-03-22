// ============================================================
// DRAG & CAMERA ORBIT — edit-mode dragging + orbit controls
// ============================================================
/* global THREE */
import { renderer, camera, DPLANE, updCam, getCam, setCam, panCam } from './scene.js';
import { meshes, placed, saveState } from './items-registry.js';
import { COLLISION_RADIUS, DESK_BOUNDS } from './config.js';

const rc = new THREE.Raycaster();
let dragG = null, dox = 0, doz = 0, dragging = false, orbiting = false, panning = false;
let lmx = 0, lmy = 0;
export let editMode = false;
export let locked = false;
export function setEditMode(v) { editMode = v; }
export function setLocked(v) { locked = v; }

// Generic item click callbacks (set by ui.js)
const itemClickHandlers = {};
export function setOnItemClick(id, fn) { itemClickHandlers[id] = fn; }
export function clearHoverHighlight() { setHoverHighlight(null); }

function handleItemClick(coords) {
  rc.setFromCamera(coords, camera);
  const hits = rc.intersectObjects(meshes, false);
  if (hits.length && hits[0].object.userData.pg) {
    const id = hits[0].object.userData.pg.userData.id;
    if (id && itemClickHandlers[id]) { itemClickHandlers[id](); return true; }
  }
  return false;
}

function ndc(e) {
  const r = renderer.domElement.getBoundingClientRect();
  return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
}

let clickStartX = 0, clickStartY = 0;

renderer.domElement.addEventListener('mousedown', function (e) {
  clickStartX = e.clientX; clickStartY = e.clientY;
  if (editMode && !locked && e.button === 0 && !e.altKey) {
    rc.setFromCamera(ndc(e), camera);
    const hits = rc.intersectObjects(meshes, false);
    if (hits.length && hits[0].object.userData.pg) {
      dragG = hits[0].object.userData.pg; dragging = true;
      document.body.style.cursor = 'grabbing';
      const pt = new THREE.Vector3();
      if (rc.ray.intersectPlane(DPLANE, pt)) { dox = dragG.position.x - pt.x; doz = dragG.position.z - pt.z; }
      e.preventDefault(); return;
    }
  }
  if (e.altKey || e.button === 2) { orbiting = true; lmx = e.clientX; lmy = e.clientY; }
  if (e.button === 1) { panning = true; lmx = e.clientX; lmy = e.clientY; e.preventDefault(); }
});

function getCollisionRadius(group) {
  return COLLISION_RADIUS[group.userData.id] || COLLISION_RADIUS.default;
}

function clampWithCollision(group, newX, newZ) {
  const r1 = getCollisionRadius(group);
  let cx = newX, cz = newZ;
  Object.keys(placed).forEach(id => {
    const other = placed[id].g;
    if (other === group) return;
    const r2 = getCollisionRadius(other);
    const dx = cx - other.position.x;
    const dz = cz - other.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const minDist = r1 + r2;
    if (dist < minDist && dist > 0.001) {
      const overlap = minDist - dist;
      const nx = dx / dist, nz = dz / dist;
      cx += nx * overlap;
      cz += nz * overlap;
    }
  });
  cx = Math.max(DESK_BOUNDS.xMin, Math.min(DESK_BOUNDS.xMax, cx));
  cz = Math.max(DESK_BOUNDS.zMin, Math.min(DESK_BOUNDS.zMax, cz));
  return { x: cx, z: cz };
}

// --- Edit mode hover highlight ---
let hoverG = null;
function setHoverHighlight(group) {
  if (hoverG === group) return;
  if (hoverG) { // clear previous
    hoverG.traverse(c => { if (c.isMesh && c.material && c.material._origEmissive !== undefined) { c.material.emissiveIntensity = c.material._origEmissive; delete c.material._origEmissive; } });
  }
  hoverG = group;
  if (hoverG) { // apply new
    hoverG.traverse(c => { if (c.isMesh && c.material && c.material.emissiveIntensity !== undefined) { c.material._origEmissive = c.material.emissiveIntensity; c.material.emissiveIntensity = c.material._origEmissive + .35; } });
  }
}

document.addEventListener('mousemove', function (e) {
  // Hover highlight in edit mode
  if (editMode && !locked && !dragging) {
    rc.setFromCamera(ndc(e), camera);
    const hits = rc.intersectObjects(meshes, false);
    if (hits.length && hits[0].object.userData.pg) {
      setHoverHighlight(hits[0].object.userData.pg);
      document.body.style.cursor = 'grab';
    } else {
      setHoverHighlight(null);
      document.body.style.cursor = editMode ? 'default' : '';
    }
  }
  if (dragging && dragG && editMode && !locked) {
    rc.setFromCamera(ndc(e), camera);
    const pt = new THREE.Vector3();
    if (rc.ray.intersectPlane(DPLANE, pt)) {
      const rawX = Math.max(DESK_BOUNDS.xMin, Math.min(DESK_BOUNDS.xMax, pt.x + dox));
      const rawZ = Math.max(DESK_BOUNDS.zMin, Math.min(DESK_BOUNDS.zMax, pt.z + doz));
      const clamped = clampWithCollision(dragG, rawX, rawZ);
      dragG.position.x = clamped.x;
      dragG.position.z = clamped.z;
    }
  }
  if (orbiting) {
    const c = getCam();
    setCam(c.camT - (e.clientX - lmx) * .007, Math.max(.06, Math.min(1.15, c.camP - (e.clientY - lmy) * .005)));
    lmx = e.clientX; lmy = e.clientY; updCam();
  }
  if (panning) {
    const c = getCam();
    const ps = c.camR * .002;
    panCam(-(e.clientX - lmx) * ps * Math.cos(c.camT) + (e.clientY - lmy) * ps * Math.sin(c.camT),
           (e.clientX - lmx) * ps * Math.sin(c.camT) + (e.clientY - lmy) * ps * Math.cos(c.camT));
    lmx = e.clientX; lmy = e.clientY; updCam();
  }
});

document.addEventListener('mouseup', function (e) {
  const dx = e.clientX - clickStartX, dy = e.clientY - clickStartY;
  const isClick = Math.abs(dx) < 5 && Math.abs(dy) < 5;
  if (isClick && !editMode && !orbiting && e.button === 0) {
    handleItemClick(ndc(e));
  }
  if (dragging) { saveState(); setHoverHighlight(null); }
  dragging = false; dragG = null; orbiting = false; panning = false;
  document.body.style.cursor = editMode ? 'default' : '';
});

renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
renderer.domElement.addEventListener('wheel', function (e) {
  const c = getCam();
  setCam(undefined, undefined, Math.max(5, Math.min(22, c.camR + e.deltaY * .012)));
  updCam();
});

// --- Touch support ---
function ndcTouch(t) {
  const r = renderer.domElement.getBoundingClientRect();
  return new THREE.Vector2(((t.clientX - r.left) / r.width) * 2 - 1, -((t.clientY - r.top) / r.height) * 2 + 1);
}

let touchStartX = 0, touchStartY = 0, touchCount = 0, pinchDist = 0;
let touchOrbitStarted = false;
let pinchMidX = 0, pinchMidY = 0; // midpoint for two-finger pan

renderer.domElement.addEventListener('touchstart', function (e) {
  touchCount = e.touches.length;
  const t = e.touches[0];
  touchStartX = t.clientX; touchStartY = t.clientY;
  touchOrbitStarted = false;

  if (touchCount === 2) {
    const dx = e.touches[1].clientX - e.touches[0].clientX;
    const dy = e.touches[1].clientY - e.touches[0].clientY;
    pinchDist = Math.sqrt(dx * dx + dy * dy);
    pinchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    pinchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    return;
  }

  if (editMode && !locked && touchCount === 1) {
    rc.setFromCamera(ndcTouch(t), camera);
    const hits = rc.intersectObjects(meshes, false);
    if (hits.length && hits[0].object.userData.pg) {
      dragG = hits[0].object.userData.pg; dragging = true;
      const pt = new THREE.Vector3();
      if (rc.ray.intersectPlane(DPLANE, pt)) { dox = dragG.position.x - pt.x; doz = dragG.position.z - pt.z; }
      e.preventDefault(); return;
    }
  }
  // Single finger — mark orbiting but don't move camera until dead zone exceeded
  if (touchCount === 1 && !editMode) { orbiting = true; lmx = t.clientX; lmy = t.clientY; }
}, { passive: false });

renderer.domElement.addEventListener('touchmove', function (e) {
  e.preventDefault();
  if (touchCount === 2 && e.touches.length === 2) {
    const dx = e.touches[1].clientX - e.touches[0].clientX;
    const dy = e.touches[1].clientY - e.touches[0].clientY;
    const newDist = Math.sqrt(dx * dx + dy * dy);
    // Pinch zoom
    const c = getCam();
    setCam(undefined, undefined, Math.max(5, Math.min(22, c.camR - (newDist - pinchDist) * .03)));
    pinchDist = newDist;
    // Two-finger pan — midpoint movement
    const newMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const newMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    const panScale = c.camR * .003;
    panCam(-(newMidX - pinchMidX) * panScale * Math.cos(c.camT) + (newMidY - pinchMidY) * panScale * Math.sin(c.camT),
           (newMidX - pinchMidX) * panScale * Math.sin(c.camT) + (newMidY - pinchMidY) * panScale * Math.cos(c.camT));
    pinchMidX = newMidX; pinchMidY = newMidY;
    updCam(); return;
  }
  const t = e.touches[0];
  if (dragging && dragG && editMode && !locked) {
    rc.setFromCamera(ndcTouch(t), camera);
    const pt = new THREE.Vector3();
    if (rc.ray.intersectPlane(DPLANE, pt)) {
      const clamped = clampWithCollision(dragG, Math.max(DESK_BOUNDS.xMin, Math.min(DESK_BOUNDS.xMax, pt.x + dox)), Math.max(DESK_BOUNDS.zMin, Math.min(DESK_BOUNDS.zMax, pt.z + doz)));
      dragG.position.x = clamped.x; dragG.position.z = clamped.z;
    }
  }
  if (orbiting && !dragging) {
    // Dead zone: don't orbit until finger moves >8px from start (prevents tap jitter)
    if (!touchOrbitStarted) {
      const dx = t.clientX - touchStartX, dy = t.clientY - touchStartY;
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      touchOrbitStarted = true;
      lmx = t.clientX; lmy = t.clientY;
    }
    const c = getCam();
    setCam(c.camT - (t.clientX - lmx) * .007, Math.max(.06, Math.min(1.15, c.camP - (t.clientY - lmy) * .005)));
    lmx = t.clientX; lmy = t.clientY; updCam();
  }
}, { passive: false });

renderer.domElement.addEventListener('touchend', function (e) {
  if (touchCount === 1 && e.changedTouches.length) {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX, dy = t.clientY - touchStartY;
    const isTap = Math.abs(dx) < 10 && Math.abs(dy) < 10;
    if (isTap && !editMode) {
      // Use start position for raycast (more accurate for taps)
      const r = renderer.domElement.getBoundingClientRect();
      const tapNdc = new THREE.Vector2(((touchStartX - r.left) / r.width) * 2 - 1, -((touchStartY - r.top) / r.height) * 2 + 1);
      handleItemClick(tapNdc);
    }
  }
  if (dragging) saveState();
  dragging = false; dragG = null; orbiting = false; touchOrbitStarted = false; touchCount = 0;
});
