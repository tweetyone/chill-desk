// ============================================================
// CONFIG — all tunable presets in one place
// ============================================================

// --- Camera defaults ---
export const CAMERA = {
  theta: 0,       // horizontal orbit angle
  phi: .42,       // vertical tilt (higher = more top-down)
  radius: 14,     // distance from center
  lookAt: [0, 2, 0],
  fov: 48,
};

// --- Brightness ---
export const BRIGHTNESS_DEFAULT = 50;

// --- Lighting base intensities ---
// Order: [hemi, fill, winLight, deskFill1, deskFill2, ceilLight, ceilSpot]
export const LIGHT_BASE = [.5, .65, .35, .4, .22, 0, 0];

export const DAY_LIGHT_BASE  = [1.4, 1.2, .9, .6, .35, 0, 0];
export const NIGHT_LIGHT_BASE = [.22, .18, .12, .18, .1, 0, 0];

// --- Item default positions ---
// Each: [x, yOffset (added to SURF), z, rotationY]
export const ITEM_POSITIONS = {
  lamp:     [-5.2, 0,    -1.4, .1],
  plant1:   [-3.6, 0,    -.4,  0],
  notebook: [-.8,  .033, .5,   .05],
  books:    [.8,   0,    .4,   .1],
  cup:      [.8,   .033, .8,   0],
  dclock:   [.6,   0,    -1.6, 0],
  candle1:  [2.2,  0,    -.2,  0],
  candle2:  [1.6,  0,    -1.1, 0],
  player:   [4.5,  .25,  -.4,  0],
  clock:    [2.6,  .065, -1.6, 0],
  plant2:   [5.8,  0,    1.0,  0],
  glasses:  [-1.0, .012, 1.5,  -.2],
  teapot:   [1.0,  .28,  1.4,  .3],
};

// --- Default items on desk at startup ---
export const DEFAULT_ITEMS = ['lamp', 'plant1', 'notebook', 'cup', 'dclock', 'candle1', 'player'];

// --- Auto-enable on load (button IDs to click after startup) ---
export const AUTO_ENABLE = ['b-lamp', 'b-candle'];

// --- Collision radii for drag (per item id) ---
export const COLLISION_RADIUS = {
  lamp: 1.0, player: 1.4, candle1: .3, candle2: .3, plant1: .5, plant2: .4,
  cup: .35, notebook: .6, clock: .35, books: .5, glasses: .3, teapot: .35, dclock: .8,
  default: .5,
};

// --- Desk drag bounds ---
export const DESK_BOUNDS = {
  xMin: -6.4, xMax: 6.4,
  zMin: -2.6, zMax: 2.6,
};

// --- Default background ---
export const DEFAULT_BG = 'city';
