/**
 * Electron Main Process
 * Launches the Universe Evolution Simulator as a desktop app
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            // CRITICAL: Enable hardware acceleration and WebGL
            enableBlinkFeatures: 'WebGL2Compute',
            offscreen: false
        },
        backgroundColor: '#000000',
        title: 'Universe Evolution Simulator',
        icon: path.join(__dirname, 'icon.ico')
    });

    // Load the index.html
    mainWindow.loadFile('index.html');

    // Open DevTools in development (comment out for production)
    // mainWindow.webContents.openDevTools();

    // CRITICAL: Force enable hardware acceleration
    app.commandLine.appendSwitch('enable-webgl');
    app.commandLine.appendSwitch('enable-webgl2-compute-context');
    app.commandLine.appendSwitch('ignore-gpu-blacklist');
    app.commandLine.appendSwitch('enable-gpu-rasterization');
    app.commandLine.appendSwitch('enable-zero-copy');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Log GPU info
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('✅ Simulator loaded successfully');
        console.log('GPU Features:', app.getGPUFeatureStatus());
    });
}

// Disable hardware acceleration causes issues - we WANT it enabled
// app.disableHardwareAcceleration(); // DON'T DO THIS!

// Create window when app is ready
app.whenReady().then(() => {
    console.log('🚀 Starting Universe Evolution Simulator...');
    console.log('Electron version:', process.versions.electron);
    console.log('Chrome version:', process.versions.chrome);

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
