# Chill Desk 🕯

An interactive 3D desktop scene built with Three.js. Customize your cozy workspace with draggable items, ambient lighting, background scenes, music, and rain sounds.

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
| 🎵 | Toggle music + Spotify |
| 🌧 | Toggle rain sounds |
| 🌙 | Day/night mode |
| 🔆 | Brightness slider |
| ✏️ | Edit mode (drag items) |
| 🔒 | Lock layout |

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `L` | Toggle desk lamp |
| `C` | Toggle ceiling lantern |
| `K` | Toggle candles |
| `M` | Toggle music |
| `R` | Toggle rain |
| `N` | Day/night switch |
| `E` | Edit mode |
| `I` | Items shelf |
| `B` | Background panel |
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

## Project Structure

```
chill-desk/
├── index.html              # HTML shell + Spotify embed
├── css/
│   └── style.css           # All styles (responsive, mobile)
├── js/
│   ├── main.js             # Entry point, animation loop, clock
│   ├── scene.js            # Three.js scene, room, lighting, lantern
│   ├── items.js            # 3D item factory functions
│   ├── items-registry.js   # Item definitions, place/remove logic
│   ├── backgrounds.js      # 2D canvas backgrounds (8 scenes)
│   ├── audio.js            # Web Audio synth music + rain
│   ├── drag.js             # Edit-mode drag, camera orbit, touch, collision
│   └── ui.js               # Toolbar, panels, keyboard shortcuts, a11y
└── README.md
```

## Backgrounds

City night · Rainy night · Forest night · Forest day · Beach · Sunset · Deep space · Morning dawn

## Items

Desk lamp · Vinyl player · Candles (×2) · Plants (×2) · Coffee cup · Notebook · Analog clock · Books · Glasses · Teapot · Digital clock

## Tech

- Three.js r128 (CDN)
- Vanilla ES Modules (no build step)
- Web Audio API for ambient sounds
- Canvas 2D for animated backgrounds
- Spotify oEmbed for music streaming
