# Chill Desk ☕

An interactive 3D desktop scene built with Three.js. Customize your cozy workspace with draggable items, ambient lighting, background scenes, music, and ambient sounds.

## Quick Start

This project uses ES Modules, so it needs a local HTTP server (can't open `index.html` directly via `file://`).

```bash
# Navigate to the project folder
cd chill-desk

# Start a local server (Python 3)
python3 -m http.server 8765

# Open in browser
open http://localhost:8765
```

Or use any other static server:

```bash
# Node.js
npx serve .

# PHP
php -S localhost:8765
```

## Controls

### Toolbar Buttons
| Button | Function |
|--------|----------|
| 📦 | Open items shelf |
| 🌄 | Switch background scene |
| 💡 | Toggle desk lamp |
| 🔦 | Toggle ceiling lantern |
| 🕯 | Toggle candles |
| 🎵 | Music player (SoundCloud / Spotify / NetEase) |
| 🎧 | Ambient sounds panel |
| 🌙 | Day/night mode |
| 🔆 | Brightness slider |
| ⛶ | Fullscreen |
| ✏️ | Edit mode (drag items) |
| EN/中 | Language toggle (English / Chinese) |

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `L` | Toggle desk lamp |
| `C` | Toggle ceiling lantern |
| `K` | Toggle candles |
| `M` | Toggle music |
| `A` | Ambient sounds |
| `N` | Day/night switch |
| `E` | Edit mode |
| `I` | Items shelf |
| `B` | Background panel |
| `F` | Fullscreen |
| `.` | Brightness |
| `Esc` | Close panels / exit edit |

### 3D Interaction
- Click the record player to toggle music
- Click the desk lamp to toggle it on/off
- Click candles to light/extinguish them
- In edit mode: drag items to rearrange (items collide, won't overlap)
- Alt+drag or right-drag to orbit camera
- Scroll to zoom

### Touch (Mobile)
- Single finger drag to orbit
- Pinch to zoom
- Tap items to interact
- Edit mode: drag to rearrange

## Features

### Music
- **SoundCloud lo-fi playlist** — 11 curated tracks with custom player UI (play/pause, next/prev, shuffle)
- **Spotify** — embedded playlist player
- **NetEase Cloud Music (网易云音乐)** — embedded player
- Tonearm animation on the 3D record player syncs with music state

### Ambient Sounds
Five ambient sound layers, each with independent volume control:
- 🌧 Rain · 🔥 Fireplace · 🌊 Waves · 🐦 Birds · 💨 Wind
- All synthesized with Web Audio API (no audio files)
- State persisted in localStorage

### Internationalization
- Bilingual support: Chinese (中文) and English
- Auto-detects system language on first visit
- Manual toggle via toolbar button
- All UI text, item names, background names translated

### Other
- 🍅 Pomodoro focus timer (25min work / 5min break)
- 📦 14 desk items to place and arrange
- 🌄 8 animated canvas backgrounds
- 💾 Layout and preferences saved to localStorage

## Project Structure

```
chill-desk/
├── index.html              # HTML shell + music embeds
├── favicon.ico             # Coffee cup favicon
├── css/
│   └── style.css           # All styles (responsive, mobile)
├── js/
│   ├── main.js             # Entry point, animation loop, clock, pomodoro
│   ├── scene.js            # Three.js scene, room, lighting, lantern
│   ├── items.js            # 3D item factory functions
│   ├── items-registry.js   # Item definitions, place/remove logic
│   ├── backgrounds.js      # 2D canvas backgrounds (8 scenes)
│   ├── audio.js            # SoundCloud player + ambient sounds (Web Audio)
│   ├── drag.js             # Edit-mode drag, camera orbit, touch, collision
│   ├── ui.js               # Toolbar, panels, keyboard shortcuts, a11y
│   ├── config.js           # Tunable constants (positions, colors, defaults)
│   └── i18n.js             # Bilingual translations (zh/en)
└── assets/
    └── 3d_9cat.glb         # Desk pet 3D model
```

## Backgrounds

City night · Rainy night · Forest night · Forest day · Beach · Sunset · Deep space · Morning dawn

## Items

Desk lamp · Vinyl player · Candles (×2) · Plants (×2) · Coffee cup · Notebook · Analog clock · Books · Glasses · Teapot · Digital clock · Cat

## Tech

- Three.js r128 (CDN)
- Vanilla ES Modules (no build step)
- Web Audio API for ambient sounds
- Canvas 2D for animated backgrounds
- SoundCloud Widget API for music
- Spotify & NetEase embeds
