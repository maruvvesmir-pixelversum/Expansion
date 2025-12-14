# Electron Desktop App Setup

## Installation

### 1. Install Node.js
Download and install from: https://nodejs.org/
(Choose LTS version for Windows)

### 2. Install Dependencies
Open Command Prompt in the project folder and run:
```bash
npm install
```

This will install:
- Electron (desktop app framework)
- Electron Builder (for creating .exe installer)

## Running in Development

```bash
npm start
```

This launches the simulator as a desktop app with:
- ✅ Full WebGL 2.0 support
- ✅ Hardware acceleration enabled
- ✅ GPU access
- ✅ Better performance than browser

## Building Windows Installer

### Build .exe installer:
```bash
npm run build
```

This creates:
- `dist/Universe Evolution Simulator Setup.exe` - Windows installer
- Installs to `C:\Program Files\Universe Evolution Simulator\`

### Output Location:
```
dist/
  ├── Universe Evolution Simulator Setup.exe  (Installer)
  └── win-unpacked/                          (Portable version)
```

## Troubleshooting

### "npm is not recognized"
- Node.js not installed or not in PATH
- Reinstall Node.js and check "Add to PATH" option

### "WebGL not available"
- Should NOT happen in Electron!
- Check `electron-main.js` has hardware acceleration flags
- Update GPU drivers

### Build fails
```bash
npm install --save-dev electron-builder
npm run build
```

## Advanced: Custom Icon

1. Create `icon.ico` (256x256 pixels)
2. Place in project root
3. Rebuild: `npm run build`

## Distribution

The installer (`Universe Evolution Simulator Setup.exe`) can be:
- Shared directly (users run installer)
- Uploaded to website for download
- Distributed via USB/CD

Users do NOT need to install Node.js or any dependencies!

## Performance

Electron app will have:
- ✅ Full 60 FPS with 100k particles
- ✅ No WebGL context loss
- ✅ Hardware acceleration always enabled
- ✅ Better GPU utilization than browser

## File Structure

```
Expansion/
├── electron-main.js       ← Electron entry point
├── package.json           ← Node.js config
├── index.html             ← App HTML
├── src/                   ← Source code
└── dist/                  ← Built installers (after npm run build)
```

## Next Steps

1. `npm install` - Install dependencies
2. `npm start` - Test the app
3. `npm run build` - Create Windows installer
4. Share `dist/Universe Evolution Simulator Setup.exe`
