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
| 💡 | Lights panel (desk lamp, ceiling, candles) |
| 🎵 | Music player (Bandcamp / Spotify / NetEase) |
| 🎧 | Ambient sounds panel |
| 🔆 | Brightness slider |
| ⛶ | Fullscreen (hidden on iOS) |
| ✏️ | Edit mode (drag items) |
| 📝 | Todo list |
| ? | Help |
| ⚙️ | Settings (language, about) |

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `L` | Toggle desk lamp |
| `C` | Toggle ceiling lantern |
| `K` | Toggle candles |
| `M` | Toggle music |
| `A` | Ambient sounds |
| `E` | Edit mode |
| `I` | Items shelf |
| `B` | Background panel |
| `T` | Todo list |
| `H` | Help |
| `F` | Fullscreen |
| `.` | Brightness |
| `Esc` | Close panels / exit edit |

### Interaction
- Click the record player to toggle music
- Click the desk lamp to toggle it on/off
- Click candles to light/extinguish them
- Click the tomato to start/pause pomodoro timer
- In edit mode: drag items to rearrange
- Alt+drag or right-drag to orbit camera
- Middle-drag to pan camera
- Scroll to zoom

### Touch (Mobile)
- Single finger swipe to orbit
- Two-finger pinch to zoom
- Two-finger drag to pan
- Tap items to interact
- Edit mode: drag to rearrange

## Features

### Music
- **Bandcamp** — default lo-fi playlist, no login needed, free
- **Spotify** — embedded playlist player (Premium for full playback)
- **NetEase Cloud Music (网易云音乐)** — embedded player
- **Custom playlists** — paste a Spotify or NetEase URL to load your own playlist
- Tonearm animation on the 3D record player syncs with music state

### Ambient Sounds
Five ambient sound layers, each with independent volume control:
- 🌧 Rain · 🔥 Fireplace · 🌊 Waves · 🐦 Birds · 💨 Wind
- All synthesized with Web Audio API (no audio files)
- State persisted in localStorage

### Todo List
- Sticky note todo list with add/check/delete
- Close with ✕ or toggle with toolbar button
- Clear completed tasks in one click
- Saved to localStorage

### Internationalization
- Bilingual support: Chinese (中文) and English
- Auto-detects system language on first visit
- Switch via Settings panel
- All UI text, item names, background names translated

### Other
- 🍅 3D Pomodoro focus timer (click tomato to start, 25min work / 5min break)
- 📦 15 desk items to place and arrange
- 🌄 9 animated canvas backgrounds (including snowy night)
- 💾 Layout and preferences saved to localStorage
- ☕ Coffee cup favicon

## Project Structure

```
chill-desk/
├── index.html              # HTML shell + music embeds + panels
├── favicon.ico             # Coffee cup favicon
├── css/
│   └── style.css           # All styles (responsive, mobile)
├── js/
│   ├── main.js             # Entry point, animation loop, clock, pomodoro
│   ├── scene.js            # Three.js scene, room, lighting, camera pan
│   ├── items.js            # 3D item factory functions
│   ├── items-registry.js   # Item definitions, place/remove logic
│   ├── backgrounds.js      # 2D canvas backgrounds (9 scenes)
│   ├── audio.js            # Ambient sounds (Web Audio API)
│   ├── drag.js             # Edit-mode drag, camera orbit/pan/zoom, touch
│   ├── ui.js               # Toolbar, panels, todo, keyboard shortcuts
│   ├── config.js           # Tunable constants (positions, colors, defaults)
│   └── i18n.js             # Bilingual translations (zh/en)
└── assets/
    └── 3d_9cat.glb         # Desk pet 3D model
```

## Backgrounds

City night · Rainy night · Forest night · Forest day · Beach · Sunset · Deep space · Morning dawn · Snowy night

## Items

Desk lamp · Vinyl player · Candles (×2) · Plants (×2) · Coffee cup · Notebook · Analog clock · Books · Glasses · Teapot · Digital clock · Cat · Pomodoro timer

## Tech

- Three.js r128 (CDN)
- Vanilla ES Modules (no build step)
- Web Audio API for ambient sounds
- Canvas 2D for animated backgrounds
- Bandcamp, Spotify & NetEase embeds for music

## Contributing

Chill Desk is open source! Build your perfect desk, add new items, or suggest ideas — all contributions welcome.
