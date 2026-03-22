// ============================================================
// I18N — bilingual support (zh / en)
// ============================================================

const LANGS = {
  zh: {
    // Toolbar & panels
    pomoTitle: '点击开始专注',
    editBadge: '编辑模式 — 拖动物品重新摆放',
    keyHint: '快捷键: L灯 C吊灯 M音乐 A氛围 E编辑 F全屏',
    shelfTitle: '物品架',
    shelfDesc: '点击开关切换上桌 / 收起',
    shelfReset: '恢复默认',
    shelfResetTitle: '恢复默认布局',
    bgTitle: '背景',
    brightness: '☀ 亮度',
    panelGroup: '面板',
    lightGroup: '灯光与氛围',
    sceneGroup: '场景',
    editGroup: '编辑',
    // Buttons
    btnItems: '物品架',
    btnItemsT: '物品架 (I)',
    btnBg: '背景切换',
    btnBgT: '背景 (B)',
    btnLamp: '台灯',
    btnLampT: '台灯 (L)',
    btnCeil: '吊灯',
    btnCeilT: '吊灯 (C)',
    btnCandle: '蜡烛',
    btnCandleT: '蜡烛 (K)',
    btnMusic: '音乐',
    btnMusicT: '音乐 (M)',
    btnAmbient: '氛围音',
    btnAmbientT: '氛围 (A)',
    btnDN: '日夜切换',
    btnDNT: '日夜 (N)',
    btnBright: '亮度调节',
    btnBrightT: '亮度 (.)',
    btnFS: '全屏',
    btnFST: '全屏 (F)',
    btnEdit: '编辑模式',
    btnEditT: '编辑 (E)',
    editLock: '固定 (E)',
    editUnlock: '编辑 (E)',
    // Ambient
    ambHeader: '🎧 氛围音效',
    ambRain: '雨声', ambFire: '壁炉', ambWave: '海浪', ambBird: '鸟鸣', ambWind: '风声',
    // Help
    helpHeader: '❓ 帮助',
    helpTap: '点击物品交互（台灯、蜡烛、唱片机）',
    helpOrbit: '右键拖动 / Alt+拖动 旋转视角',
    helpZoom: '滚轮缩放（手机双指捏合）',
    helpPan: '中键拖动平移（手机双指滑动）',
    helpEdit: '编辑模式：拖动物品重新摆放',
    helpPomo: '点击番茄开始/暂停专注计时',
    helpKeys: 'L 台灯 · C 吊灯 · K 蜡烛 · M 音乐 · A 氛围 · E 编辑 · I 物品 · B 背景 · H 帮助',
    // Settings
    settingsHeader: '⚙ 设置',
    settingsLang: '语言',
    lightsHeader: '💡 灯光',
    lightLamp: '台灯', lightCeil: '吊灯', lightCandle: '蜡烛',
    btnLights: '灯光', btnLightsT: '灯光',
    btnTodo: '便签', btnTodoT: '便签 (T)',
    todoHeader: '📝 待办',
    todoPlaceholder: '添加任务...',
    btnHelp: '帮助', btnHelpT: '帮助 (H)',
    btnSettings: '设置', btnSettingsT: '设置',
    opensource: 'Chill Desk 是开源项目。打造你的专属桌面、添加新物品、或提出想法 — 欢迎参与贡献。',
    contribute: 'GitHub',
    // Music
    musicHeader: '🎵 音乐',
    lofiPrev: '上一首', lofiPlay: '播放/暂停', lofiNext: '下一首', lofiShuffle: '随机',
    spotifyLogin: '未能播放？先登录 Spotify 再回来 →',
    neteaseLogin: '未能播放？先登录网易云音乐再回来 →',
    // Items
    items: {
      lamp: ['台灯', '温暖黄铜台灯'], plant1: ['绿植 A', '茂密小盆栽'],
      notebook: ['笔记本', '翻开的笔记本'], books: ['书本', '一摞精装书'],
      cup: ['咖啡杯', '带碟咖啡杯'], dclock: ['电子钟', 'LED数字时钟'],
      candle1: ['蜡烛 A', '高挑米白蜡烛'], candle2: ['蜡烛 B', '矮胖奶油蜡烛'],
      player: ['黑胶唱机', '复古黑胶唱片机'], clock: ['座钟', '黄铜怀旧座钟'],
      plant2: ['绿植 B', '迷你盆栽'], glasses: ['眼镜', '圆框黑色眼镜'],
      teapot: ['茶壶', '陶瓷小茶壶'], cat9: ['九命猫', '神秘的九命猫'],
      pomo: ['番茄钟', '专注计时器'],
    },
    // Backgrounds
    bgs: {
      city: '深夜城市', rain: '雨夜', forest: '森林夜晚', forestday: '森林白天',
      beach: '海边风景', sunset: '黄昏晚霞', space: '深空星云', morning: '清晨破晓', snow: '冬夜飘雪',
    },
  },
  en: {
    pomoTitle: 'Click to start focus',
    editBadge: 'Edit Mode — drag items to rearrange',
    keyHint: 'Keys: L Lamp  C Ceiling  M Music  A Ambient  E Edit  F Fullscreen',
    shelfTitle: 'Items',
    shelfDesc: 'Toggle items on / off the desk',
    shelfReset: 'Reset',
    shelfResetTitle: 'Reset to default layout',
    bgTitle: 'Background',
    brightness: '☀ Brightness',
    panelGroup: 'Panels',
    lightGroup: 'Lights & Ambient',
    sceneGroup: 'Scene',
    editGroup: 'Edit',
    btnItems: 'Items',
    btnItemsT: 'Items (I)',
    btnBg: 'Background',
    btnBgT: 'Background (B)',
    btnLamp: 'Desk lamp',
    btnLampT: 'Lamp (L)',
    btnCeil: 'Ceiling light',
    btnCeilT: 'Ceiling (C)',
    btnCandle: 'Candles',
    btnCandleT: 'Candles (K)',
    btnMusic: 'Music',
    btnMusicT: 'Music (M)',
    btnAmbient: 'Ambient',
    btnAmbientT: 'Ambient (A)',
    btnDN: 'Day / Night',
    btnDNT: 'Day/Night (N)',
    btnBright: 'Brightness',
    btnBrightT: 'Brightness (.)',
    btnFS: 'Fullscreen',
    btnFST: 'Fullscreen (F)',
    btnEdit: 'Edit mode',
    btnEditT: 'Edit (E)',
    editLock: 'Lock (E)',
    editUnlock: 'Edit (E)',
    ambHeader: '🎧 Ambient Sounds',
    ambRain: 'Rain', ambFire: 'Fireplace', ambWave: 'Waves', ambBird: 'Birds', ambWind: 'Wind',
    helpHeader: '❓ Help',
    helpTap: 'Tap items to interact (lamp, candles, record player)',
    helpOrbit: 'Right-drag / Alt+drag to orbit camera',
    helpZoom: 'Scroll to zoom (pinch on mobile)',
    helpPan: 'Middle-drag to pan (two-finger drag on mobile)',
    helpEdit: 'Edit mode: drag items to rearrange',
    helpPomo: 'Tap tomato to start/pause focus timer',
    helpKeys: 'L Lamp · C Ceiling · K Candles · M Music · A Ambient · E Edit · I Items · B Background · H Help',
    settingsHeader: '⚙ Settings',
    settingsLang: 'Language',
    lightsHeader: '💡 Lights',
    lightLamp: 'Desk Lamp', lightCeil: 'Ceiling Light', lightCandle: 'Candles',
    btnLights: 'Lights', btnLightsT: 'Lights',
    btnTodo: 'Todo', btnTodoT: 'Todo (T)',
    todoHeader: '📝 Todo',
    todoPlaceholder: 'Add a task...',
    btnHelp: 'Help', btnHelpT: 'Help (H)',
    btnSettings: 'Settings', btnSettingsT: 'Settings',
    opensource: 'Chill Desk is open source. Build your perfect desk, add new items, or suggest ideas — all contributions welcome.',
    contribute: 'GitHub',
    musicHeader: '🎵 Music',
    lofiPrev: 'Previous', lofiPlay: 'Play / Pause', lofiNext: 'Next', lofiShuffle: 'Shuffle',
    spotifyLogin: "Can't play? Log in to Spotify first →",
    neteaseLogin: "Can't play? Log in to NetEase Music first →",
    items: {
      lamp: ['Desk Lamp', 'Warm brass desk lamp'], plant1: ['Plant A', 'Lush small potted plant'],
      notebook: ['Notebook', 'Open notebook'], books: ['Books', 'Stack of hardcovers'],
      cup: ['Coffee Cup', 'Coffee cup with saucer'], dclock: ['Digital Clock', 'LED digital clock'],
      candle1: ['Candle A', 'Tall white candle'], candle2: ['Candle B', 'Short cream candle'],
      player: ['Vinyl Player', 'Retro vinyl record player'], clock: ['Clock', 'Brass desk clock'],
      plant2: ['Plant B', 'Mini potted plant'], glasses: ['Glasses', 'Round black glasses'],
      teapot: ['Teapot', 'Ceramic teapot'], cat9: ['Cat', 'Mysterious nine-lives cat'],
      pomo: ['Pomodoro', 'Focus timer'],
    },
    bgs: {
      city: 'City Night', rain: 'Rainy Night', forest: 'Forest Night', forestday: 'Forest Day',
      beach: 'Beach', sunset: 'Sunset', space: 'Deep Space', morning: 'Morning Dawn', snow: 'Snowy Night',
    },
  },
};

// Detect from: saved preference > system language > default zh
let curLang = 'zh';
try {
  const saved = localStorage.getItem('chilldesk_lang');
  if (saved && LANGS[saved]) {
    curLang = saved;
  } else {
    // Auto-detect from browser language
    const sysLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    curLang = sysLang.startsWith('zh') ? 'zh' : 'en';
  }
} catch (e) { /* noop */ }

export function t(key) { return LANGS[curLang][key] || LANGS.zh[key] || key; }
export function tItem(id) { return (LANGS[curLang].items && LANGS[curLang].items[id]) || LANGS.zh.items[id] || [id, '']; }
export function tBg(id) { return (LANGS[curLang].bgs && LANGS[curLang].bgs[id]) || LANGS.zh.bgs[id] || id; }
export function getLang() { return curLang; }

export function setLang(lang) {
  if (!LANGS[lang]) return;
  curLang = lang;
  try { localStorage.setItem('chilldesk_lang', lang); } catch (e) { /* noop */ }
  applyLang();
}

export function toggleLang() {
  setLang(curLang === 'zh' ? 'en' : 'zh');
}

// Apply language to all static DOM elements
function applyLang() {
  const s = (id, attr, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (attr === 'text') el.textContent = t(key);
    else el.setAttribute(attr, t(key));
  };
  // Pomodoro
  s('pomo', 'title', 'pomoTitle');
  // Badges & hints
  s('ebadge', 'text', 'editBadge');
  s('keyhint', 'text', 'keyHint');
  // Shelf
  const shelfH2 = document.querySelector('#shelf h2');
  if (shelfH2) shelfH2.textContent = t('shelfTitle');
  const shelfP = document.querySelector('#shelf p');
  if (shelfP) shelfP.textContent = t('shelfDesc');
  s('shelf-reset', 'text', 'shelfReset');
  s('shelf-reset', 'title', 'shelfResetTitle');
  s('shelf', 'aria-label', 'shelfTitle');
  // Background panel
  const bgH2 = document.querySelector('#bgp h2');
  if (bgH2) bgH2.textContent = t('bgTitle');
  s('bgp', 'aria-label', 'bgTitle');
  // Brightness
  const brLabel = document.querySelector('#brpop label');
  if (brLabel) brLabel.textContent = t('brightness');
  // Toolbar buttons
  const btnMap = {
    'b-items': ['btnItems', 'btnItemsT'], 'b-bg': ['btnBg', 'btnBgT'],
    'b-music': ['btnMusic', 'btnMusicT'],
    'b-lights': ['btnLights', 'btnLightsT'],
    'b-ambient': ['btnAmbient', 'btnAmbientT'],
    'b-bright': ['btnBright', 'btnBrightT'], 'b-fs': ['btnFS', 'btnFST'],
    'b-edit': ['btnEdit', 'btnEditT'],
    'b-todo': ['btnTodo', 'btnTodoT'],
    'b-help': ['btnHelp', 'btnHelpT'],
    'b-settings': ['btnSettings', 'btnSettingsT'],
  };
  Object.keys(btnMap).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('aria-label', t(btnMap[id][0]));
    el.setAttribute('title', t(btnMap[id][1]));
  });
  // Button groups
  document.querySelectorAll('#bar .btn-group').forEach((g, i) => {
    const keys = ['panelGroup', 'lightGroup', 'sceneGroup', 'editGroup'];
    if (keys[i]) g.setAttribute('aria-label', t(keys[i]));
  });
  // Ambient panel
  const ambH = document.querySelector('#ambient-header span');
  if (ambH) ambH.textContent = t('ambHeader');
  const ambNames = { rain: 'ambRain', fire: 'ambFire', wave: 'ambWave', bird: 'ambBird', wind: 'ambWind' };
  document.querySelectorAll('.amb-row').forEach(row => {
    const s = row.dataset.sound;
    if (s && ambNames[s]) {
      const nm = row.querySelector('.amb-name');
      if (nm) nm.textContent = t(ambNames[s]);
    }
  });
  // Todo panel
  const todoH = document.querySelector('#todo-header span');
  if (todoH) todoH.textContent = t('todoHeader');
  const todoIn = document.getElementById('todo-input');
  if (todoIn) todoIn.placeholder = t('todoPlaceholder');
  // Lights panel
  const lightsH = document.querySelector('#lights-header span');
  if (lightsH) lightsH.textContent = t('lightsHeader');
  s('light-lamp-name', 'text', 'lightLamp');
  s('light-ceil-name', 'text', 'lightCeil');
  s('light-candle-name', 'text', 'lightCandle');
  // Help panel
  const helpH = document.querySelector('#help-header span');
  if (helpH) helpH.textContent = t('helpHeader');
  s('help-tap', 'text', 'helpTap');
  s('help-orbit', 'text', 'helpOrbit');
  s('help-zoom', 'text', 'helpZoom');
  s('help-pan', 'text', 'helpPan');
  s('help-edit', 'text', 'helpEdit');
  s('help-pomo', 'text', 'helpPomo');
  s('help-keys', 'text', 'helpKeys');
  // Settings panel
  const setH = document.querySelector('#settings-header span');
  if (setH) setH.textContent = t('settingsHeader');
  s('settings-lang-label', 'text', 'settingsLang');
  // Settings footer
  s('settings-opensource', 'text', 'opensource');
  s('settings-contribute', 'text', 'contribute');
  // Music panel
  const musH = document.querySelector('#music-header span');
  if (musH) musH.textContent = t('musicHeader');
  s('lofi-prev', 'title', 'lofiPrev');
  s('lofi-play', 'title', 'lofiPlay');
  s('lofi-next', 'title', 'lofiNext');
  s('lofi-shuffle', 'title', 'lofiShuffle');
  // Login links
  document.querySelectorAll('.music-ext-link').forEach(a => {
    if (a.href.includes('spotify')) a.textContent = t('spotifyLogin');
    else if (a.href.includes('163')) a.textContent = t('neteaseLogin');
  });
  // Background names in panel
  document.querySelectorAll('.bgo-nm').forEach(nm => {
    const row = nm.closest('.bgo');
    if (!row) return;
    // Find bg id by matching current text against both languages
    Object.keys(LANGS.zh.bgs).forEach(id => {
      if (nm.textContent === LANGS.zh.bgs[id] || nm.textContent === LANGS.en.bgs[id]) {
        nm.textContent = tBg(id);
      }
    });
  });
}

// Apply on load
applyLang();
