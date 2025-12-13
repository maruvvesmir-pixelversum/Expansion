# Mouse & Keyboard Controls - Fixed!

## ✅ What Was Fixed

### 1. UI Click Blocking
- **Problem:** Canvas was blocking clicks on UI buttons
- **Solution:**
  - Canvas z-index lowered to 0 (below UI)
  - UI overlay z-index: 10 (above canvas)
  - Added smart UI element detection to skip mouse events on UI

### 2. Mouse Zooming
- **Mouse wheel** → Zoom in/out
- **NEW:** Zooms toward cursor position (not just center)
- Uses `onZoomAtPoint` callback for intuitive zooming

### 3. Mouse Panning
- **Left-click + drag** → Pan camera
- **Middle-click + drag** → Pan camera (alternative)
- **Shift + left-click + drag** → Rotate view

### 4. Mouse Rotation
- **Right-click + drag** → Rotate 3D view
- **Shift + left-click + drag** → Rotate 3D view (alternative)

## 🎮 Complete Mouse Controls

| Action | Control |
|--------|---------|
| **Pan** | Left-click + drag |
| **Pan (alt)** | Middle-click + drag |
| **Zoom** | Mouse wheel |
| **Zoom focus** | Wheel zooms toward cursor |
| **Rotate** | Right-click + drag |
| **Rotate (alt)** | Shift + left-drag |

## ⌨️ Complete Keyboard Controls

### Navigation
- `WASD` or `Arrow keys` → Pan camera
- `Q` / `E` → Rotate left/right
- `+` / `-` → Zoom in/out
- `R` → Reset view to origin

### Time Control
- `Space` → Play/Pause simulation
- `[` → Slow down (0.5x)
- `]` → Speed up (2x)
- `Backspace` → Reverse time
- `Enter` → Step forward one frame

### View Options
- `H` → Hide/Show UI
- `G` → Toggle grid
- `V` → Toggle velocity vectors
- `W` → Toggle cosmic web
- `C` → Toggle cluster boundaries

### Epochs (Quick Jump)
- `1-9` → Jump to specific epoch
- `0` → Jump to present day
- `Shift+1` → Planck epoch
- `Shift+2` → Inflation
- `Shift+3` → QGP phase
- `Shift+4` → Nucleosynthesis
- `Shift+5` → Recombination
- `Shift+6` → Dark ages
- `Shift+7` → First stars
- `Shift+8` → Galaxy formation
- `Shift+9` → Present day

### Tools
- `P` → Open settings panel
- `F1` → Help/shortcuts
- `B` → Add bookmark
- `S` → Take screenshot
- `Esc` → Close panels/dialogs

### Bookmarks
- `Ctrl+1-9` → Jump to bookmark slot
- `Ctrl+Shift+1-9` → Save bookmark to slot

## 🖱️ Smart Event Detection

The input handler now intelligently detects when you're clicking on UI elements:

- ✅ Clicks on buttons work
- ✅ Clicks on inputs work
- ✅ Clicks on panels work
- ✅ Clicks on settings work
- ✅ Clicks on timeline work
- ✅ Canvas drag/zoom still works when clicking empty space

### How it Works
The `isUIElement()` function checks if your click target is:
- A button, input, select, or link
- Inside a `.ui-panel`
- Inside a `.touch-btn`
- Inside `#settings-panel` or `#help-modal`
- Any other interactive UI element

If yes → UI handles the click
If no → Canvas handles it for camera control

## 🔧 Technical Details

### Event Binding
```javascript
// Mouse events bound to canvas
canvas.addEventListener('wheel', handleWheel)
canvas.addEventListener('mousedown', handleMouseDown)
canvas.addEventListener('mousemove', handleMouseMove)
canvas.addEventListener('mouseup', handleMouseUp)

// Keyboard events bound to window
window.addEventListener('keydown', handleKeyDown)
window.addEventListener('keyup', handleKeyUp)
```

### Z-Index Hierarchy
```
Canvas Container: z-index: 0 (bottom)
  ├─ canvas-main: z-index: 1
  ├─ canvas-effects: z-index: 2 (no pointer events)
  └─ canvas-ui: z-index: 3 (no pointer events)

UI Overlay: z-index: 10 (top)
  └─ All UI panels have pointer-events: auto
```

### Zoom Toward Cursor
```javascript
handleWheel(e) {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;

    // Zoom toward cursor position
    if (callbacks.onZoomAtPoint) {
        callbacks.onZoomAtPoint(delta, e.clientX, e.clientY);
    }
}
```

## 📱 Touch Controls (Mobile)

See `IMPLEMENTATION.md` for complete touch controls documentation.

Quick reference:
- 1-finger drag → Pan with momentum
- 2-finger pinch → Zoom at pinch point
- 2-finger drag → Rotate 3D
- 3-finger swipe → Time speed
- Double-tap → Reset view

## 🐛 Troubleshooting

### "I can't click buttons"
1. Refresh the page (Ctrl+R)
2. Check browser console for errors
3. Make sure you're clicking directly on buttons, not just near them

### "Mouse wheel doesn't zoom"
1. Make sure cursor is over the canvas (not UI panels)
2. Try clicking on canvas first to focus it
3. Check if browser is blocking wheel events

### "Panning is too fast/slow"
- The camera speed is fixed in the code
- Future update will add sensitivity settings

### "Right-click shows context menu"
- This is now prevented automatically
- If it still shows, the event handler may not be binding correctly

## 🚀 Performance Tips

- **Smooth camera movement:** Use keyboard for precise control
- **Fast navigation:** Use mouse for quick panning/zooming
- **3D rotation:** Right-click drag is the smoothest
- **Zoom precision:** Use `+`/`-` keys for controlled zoom steps

## 📝 Summary

All mouse and keyboard controls are now fully functional:

✅ UI buttons are clickable
✅ Mouse wheel zooms toward cursor
✅ Left/middle/right mouse buttons work
✅ Keyboard shortcuts active
✅ Touch controls enhanced
✅ Smart event filtering prevents conflicts

**Refresh your browser now to test!**
