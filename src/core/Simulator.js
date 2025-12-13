/**
 * Universe Evolution Simulator - Main Class
 * Version 2.47.3
 * Anthropic Cosmological Research Institute
 *
 * Coordinates all simulation subsystems
 */

import { SIMULATION, COSMOLOGICAL, UNITS } from '../utils/constants.js';
import { EPOCHS, FUTURE_SCENARIOS, getEpochByIndex } from '../data/epochs.js';
import { ParticleSystem } from './ParticleSystem.js';
import { PhysicsEngine } from '../physics/PhysicsEngine.js';
import { Renderer } from '../rendering/Renderer.js';
import { Camera } from '../ui/Camera.js';
import { UIManager } from '../ui/UIManager.js';
import { InputHandler } from '../ui/InputHandler.js';
import { SaveManager } from '../utils/SaveManager.js';

export class Simulator {
    constructor() {
        // Canvas elements
        this.canvasMain = document.getElementById('canvas-main');
        this.canvasEffects = document.getElementById('canvas-effects');
        this.canvasUI = document.getElementById('canvas-ui');

        // Simulation state
        this.isPlaying = true;
        this.isReversed = false;
        this.timeSpeed = 1e10;
        this.frameCount = 0;

        // Subsystems (initialized in init())
        this.particles = null;
        this.physics = null;
        this.renderer = null;
        this.camera = null;
        this.ui = null;
        this.input = null;
        this.saveManager = null;

        // Future scenario
        this.futureScenario = 'freeze';

        // Tracers
        this.tracers = [];
        this.tracerMode = false;
        this.maxTracers = 10;

        // Bookmarks
        this.bookmarks = [];

        // Visual options
        this.showGrid = false;
        this.showVelocities = false;
        this.showClusters = false;

        // Performance tracking
        this.fps = 60;
        this.frameTime = 16.67;
        this.lastFrameTime = performance.now();

        // Present time for timeline calculations
        this.presentTime = COSMOLOGICAL.age_universe * UNITS.Gyr_to_s;
    }

    /**
     * Initialize the simulator
     */
    async init() {
        // Create UI Manager first for loading updates
        this.ui = new UIManager();
        this.ui.updateLoading('Initializing quantum foam...', 5);

        // Resize canvases
        this.resizeCanvases();
        window.addEventListener('resize', () => this.resizeCanvases());

        // Initialize particle system
        this.ui.updateLoading('Generating primordial fluctuations...', 15);
        this.particles = new ParticleSystem(SIMULATION.particleCount);
        await this.particles.initialize();

        // Initialize physics engine
        this.ui.updateLoading('Calibrating cosmological parameters...', 40);
        this.physics = new PhysicsEngine();

        // Initialize camera
        this.ui.updateLoading('Setting up observation systems...', 55);
        this.camera = new Camera();

        // Initialize renderer
        this.ui.updateLoading('Initializing visualization engine...', 70);
        this.renderer = new Renderer(this.canvasMain, this.canvasEffects);

        // Initialize input handler
        this.ui.updateLoading('Binding control systems...', 85);
        this.setupInput();

        // Setup UI elements
        this.ui.updateLoading('Preparing interface...', 95);
        this.setupUI();

        // Hide loading screen and start
        this.ui.updateLoading('Starting simulation...', 100);
        await this.sleep(300);
        this.ui.hideLoading();

        // Start animation loop
        this.startSimulation();
    }

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Resize all canvases
     */
    resizeCanvases() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        [this.canvasMain, this.canvasEffects, this.canvasUI].forEach(canvas => {
            canvas.width = w;
            canvas.height = h;
        });

        if (this.renderer) {
            this.renderer.resize(w, h);
        }

        if (this.camera) {
            this.camera.setViewport(w, h);
        }
    }

    /**
     * Setup input handler with callbacks
     */
    setupInput() {
        this.input = new InputHandler(this.canvasMain, {
            // Camera controls
            onCameraMove: (dx, dy, dz) => {
                this.camera.stopPan(); // Stop any smooth pan
                this.camera.pan(dx, dy);
            },
            onCameraRotate: (dx, dy) => {
                this.camera.rotate(dx, dy);
            },
            onZoom: (factor) => {
                this.camera.zoomBy(factor);
            },
            onZoomAtPoint: (factor, x, y) => {
                this.camera.zoomAtPoint(factor, x, y);
                this.showZoomIndicator();
            },

            // Time controls
            onTogglePlay: () => this.togglePlay(),
            onToggleReverse: () => this.toggleReverse(),
            onSpeedChange: (factor) => this.changeSpeed(factor),

            // Epoch jumps
            onEpochJump: (index) => this.jumpToEpoch(index),

            // View controls
            onResetView: () => this.resetView(),
            onToggleUI: () => this.toggleUI(),
            onToggleGrid: () => this.toggleGrid(),
            onToggleVelocities: () => this.toggleVelocities(),
            onToggleClusters: () => this.toggleClusters(),
            onCycleFuture: () => this.cycleFutureScenario(),

            // Tools
            onToggleHelp: () => this.ui.toggleHelp(),
            onToggleSettings: () => this.ui.toggleSettings(),
            onToggleTracer: () => this.toggleTracerMode(),
            onAddBookmark: () => this.addBookmark(),
            onScreenshot: () => this.takeScreenshot(),

            // Escape
            onEscape: () => {
                if (this.ui.showHelp) this.ui.toggleHelp();
                if (this.ui.showSettings) this.ui.toggleSettings();
                if (this.tracerMode) this.toggleTracerMode();
            },

            // Touch gestures
            onDoubleTap: () => this.resetView(),
            onLongPress: (e) => {
                // Long press shows settings on touch devices
                this.ui.toggleSettings();
            },
            onTap: (e) => {
                if (this.tracerMode) {
                    this.selectParticleForTracer(e.x, e.y);
                }
            },
            onThreeFingerGesture: (type, data) => {
                // Three finger swipe for time control
                if (type === 'start') {
                    this.threeFingerStartX = data?.x ?? 0;
                } else if (type === 'move' && data) {
                    const dx = data.x - (this.threeFingerStartX ?? data.x);
                    if (Math.abs(dx) > 50) {
                        this.changeSpeed(dx > 0 ? 2 : 0.5);
                        this.threeFingerStartX = data.x;
                    }
                }
            },

            // Click for tracer selection
            onClick: (e) => {
                if (this.tracerMode) {
                    this.selectParticleForTracer(e.x, e.y);
                }
            },

            // Touch gesture feedback
            onTouchMove: (e) => {
                if (e.gestureType && e.count >= 2) {
                    this.showGestureIndicator(e.gestureType);
                }
            },
            onTouchEnd: (e) => {
                this.hideGestureIndicator();
            }
        });
    }

    /**
     * Setup UI elements and bindings
     */
    setupUI() {
        this.ui.generateSessionId();
        this.ui.initHistogram();
        this.ui.initEpochMarkers();

        // Button bindings
        document.getElementById('btn-play')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('btn-rw')?.addEventListener('click', () => this.changeSpeed(0.1));
        document.getElementById('btn-slow')?.addEventListener('click', () => this.changeSpeed(0.5));
        document.getElementById('btn-fast')?.addEventListener('click', () => this.changeSpeed(2));
        document.getElementById('btn-ff')?.addEventListener('click', () => this.changeSpeed(10));
        document.getElementById('btn-reverse')?.addEventListener('click', () => this.toggleReverse());
        document.getElementById('btn-reset')?.addEventListener('click', () => this.resetSimulation());

        // Touch buttons - Right side (view controls)
        document.getElementById('touch-settings')?.addEventListener('click', () => this.ui.toggleSettings());
        document.getElementById('touch-help')?.addEventListener('click', () => this.ui.toggleHelp());
        document.getElementById('touch-zoomin')?.addEventListener('click', () => {
            this.camera.zoomBy(1.5);
            this.showZoomIndicator();
        });
        document.getElementById('touch-zoomout')?.addEventListener('click', () => {
            this.camera.zoomBy(1/1.5);
            this.showZoomIndicator();
        });
        document.getElementById('touch-reset')?.addEventListener('click', () => this.resetView());
        document.getElementById('touch-screenshot')?.addEventListener('click', () => this.takeScreenshot());

        // Touch buttons - Left side (time controls)
        document.getElementById('touch-play')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('touch-slower')?.addEventListener('click', () => {
            this.changeSpeed(0.5);
            this.ui.showNotification('Speed: ' + this.ui.formatSpeed(this.timeSpeed));
        });
        document.getElementById('touch-faster')?.addEventListener('click', () => {
            this.changeSpeed(2);
            this.ui.showNotification('Speed: ' + this.ui.formatSpeed(this.timeSpeed));
        });
        document.getElementById('touch-reverse')?.addEventListener('click', () => this.toggleReverse());

        // Hide touch hint after first interaction
        this.setupTouchHint();

        // Timeline click
        document.getElementById('timeline-bar')?.addEventListener('click', (e) => this.handleTimelineClick(e));

        // Modal close buttons
        document.getElementById('close-help')?.addEventListener('click', () => this.ui.toggleHelp());
        document.getElementById('close-settings')?.addEventListener('click', () => this.ui.toggleSettings());

        // Settings bindings
        this.setupSettings();
    }

    /**
     * Setup settings panel bindings
     */
    setupSettings() {
        // Toggle switches
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                const id = toggle.id;
                const active = toggle.classList.contains('active');

                switch (id) {
                    case 'toggle-motion':
                        this.renderer.effects.motionBlur = active;
                        break;
                    case 'toggle-grain':
                        this.renderer.effects.filmGrain = active;
                        break;
                    case 'toggle-vignette':
                        this.renderer.effects.vignette = active;
                        break;
                    case 'toggle-web':
                        this.renderer.effects.cosmicWeb = active;
                        break;
                    case 'toggle-grid':
                        this.showGrid = active;
                        break;
                    case 'toggle-velocity':
                        this.showVelocities = active;
                        break;
                }

                this.ui.updateEffects(this.renderer.effects);
            });
        });

        // Sliders
        document.getElementById('setting-bloom')?.addEventListener('input', (e) => {
            this.renderer.effects.bloomIntensity = e.target.value / 100;
            this.renderer.effects.bloom = this.renderer.effects.bloomIntensity > 0;
        });

        document.getElementById('setting-theta')?.addEventListener('input', (e) => {
            this.physics.setParameters({ theta: e.target.value / 100 });
        });

        document.getElementById('setting-size')?.addEventListener('input', (e) => {
            this.renderer.particleSizeMultiplier = e.target.value / 100;
        });

        // Particle count
        document.getElementById('setting-particles')?.addEventListener('change', async (e) => {
            const newCount = parseInt(e.target.value);
            if (newCount !== this.particles.count) {
                this.ui.showNotification('Restart required for particle count change');
            }
        });

        // Cosmology
        document.getElementById('setting-h0')?.addEventListener('change', (e) => {
            this.physics.cosmology.H0 = parseFloat(e.target.value);
        });

        document.getElementById('setting-w')?.addEventListener('change', (e) => {
            this.physics.cosmology.w = parseFloat(e.target.value);
        });
    }

    /**
     * Start the simulation loop
     */
    startSimulation() {
        this.lastFrameTime = performance.now();
        this.animate();
    }

    /**
     * Main animation loop
     */
    animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        // Update frame stats
        this.frameCount++;
        this.fps = 1 / deltaTime;
        this.frameTime = deltaTime * 1000;

        // Update physics
        if (this.isPlaying) {
            this.physics.update(this.particles, deltaTime, this.timeSpeed, this.isReversed);
        }

        // Update camera
        this.camera.update(deltaTime);

        // Detect clusters periodically
        if (this.frameCount % 60 === 0) {
            this.physics.detectClusters(this.particles);
        }

        // Render
        const visibleCount = this.renderer.render(
            this.particles,
            this.camera,
            this.physics.cosmology.currentEpoch,
            {
                showGrid: this.showGrid,
                showVelocities: this.showVelocities,
                tracers: this.tracers,
                clusters: this.showClusters ? this.physics.getTopClusters(15) : null,
                currentFPS: this.fps
            }
        );

        // Render effects (every other frame for performance)
        if (this.frameCount % 2 === 0) {
            this.renderer.renderEffects();
        }

        // Update UI (throttled)
        if (this.frameCount % 5 === 0) {
            this.updateUI();
        }

        // Update graphs (more throttled)
        if (this.frameCount % 30 === 0) {
            this.ui.updateHistogram(this.frameCount);
            this.ui.updateGraphs(
                this.physics.cosmology.scaleHistory,
                this.physics.cosmology.tempHistory
            );
            this.particles.updateStatistics();
        }

        // Request next frame
        requestAnimationFrame(() => this.animate());
    }

    /**
     * Update UI with current state
     */
    updateUI() {
        const cosmo = this.physics.cosmology;
        const physicsState = this.physics.getState();
        const particleStats = this.particles.getStats();
        const cameraState = this.camera.getState();
        const renderStats = this.renderer.getStats();

        // Calculate timeline progress
        const futureTime = this.presentTime * 10;
        const timelineProgress = Math.min(100, (cosmo.time / futureTime) * 100);

        this.ui.update({
            // Time
            time: cosmo.time,
            timeSpeed: this.timeSpeed,
            timelineProgress,
            lookbackTime: Math.max(0, this.presentTime - cosmo.time),

            // Cosmology
            epoch: cosmo.currentEpoch,
            scaleFactor: cosmo.scaleFactor,
            redshift: cosmo.redshift,
            temperature: cosmo.temperature,
            hubbleRate: cosmo.hubbleParameter(Math.min(cosmo.redshift, 1e6)),
            expansionState: cosmo.getExpansionState(),
            density: cosmo.getMatterDensity(Math.min(cosmo.redshift, 1000)),

            // Particles
            particleCount: this.particles.count,
            visibleParticles: renderStats.visibleParticles,
            clusterCount: particleStats.clusters,
            clusteredPercent: particleStats.clusteredPercent,
            avgTemperature: particleStats.avgTemperature,
            colorDistribution: particleStats.colorDistribution,

            // Physics
            theta: physicsState.theta,
            energyDrift: physicsState.energyDrift,
            virialRatio: physicsState.virialRatio,

            // Performance
            fps: this.fps,
            frameTime: this.frameTime,
            physicsTime: physicsState.physicsTime,
            renderTime: renderStats.renderTime,
            effectsTime: renderStats.effectsTime,

            // Camera
            camera: {
                ...cameraState,
                viewScale: this.camera.getViewScale()
            }
        });

        // Update effects status
        this.ui.updateEffects(this.renderer.effects);

        // Update future scenario
        this.ui.updateFutureScenario(FUTURE_SCENARIOS[this.futureScenario]);

        // Update tracer panel
        this.ui.updateTracerPanel(this.tracerMode, this.tracers.length, this.maxTracers);
    }

    /**
     * Toggle play/pause
     */
    togglePlay() {
        this.isPlaying = !this.isPlaying;

        const btn = document.getElementById('btn-play');
        if (btn) {
            btn.textContent = this.isPlaying ? '⏸' : '▶';
            btn.classList.toggle('active', this.isPlaying);
        }

        const touchBtn = document.getElementById('touch-play');
        if (touchBtn) {
            touchBtn.textContent = this.isPlaying ? '⏸' : '▶';
        }
    }

    /**
     * Toggle time reversal
     */
    toggleReverse() {
        this.isReversed = !this.isReversed;
        this.ui.showNotification(this.isReversed ? 'Time reversed' : 'Time forward');
    }

    /**
     * Change simulation speed
     */
    changeSpeed(factor) {
        this.timeSpeed = Math.max(
            SIMULATION.minTimeStepMultiplier,
            Math.min(SIMULATION.maxTimeStepMultiplier, this.timeSpeed * factor)
        );
    }

    /**
     * Jump to specific epoch
     */
    jumpToEpoch(index) {
        // Handle 0 as future
        if (index === 0) {
            this.jumpToFuture();
            return;
        }

        // Convert 1-9 to 0-8 index
        const epochIndex = index - 1;
        const epoch = getEpochByIndex(epochIndex);

        if (epoch) {
            this.physics.cosmology.jumpToTime(epoch.timeStart);
            this.ui.showEpochInfo(epoch);
        }
    }

    /**
     * Jump to far future
     */
    jumpToFuture() {
        this.physics.cosmology.jumpToTime(this.presentTime * 2);
        this.ui.showNotification('Jumped to far future');
    }

    /**
     * Handle timeline click
     */
    handleTimelineClick(e) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const progress = x / rect.width;

        const futureTime = this.presentTime * 10;
        this.physics.cosmology.jumpToTime(progress * futureTime);
    }

    /**
     * Reset camera view
     */
    resetView() {
        this.camera.reset();
        this.ui.showNotification('View reset');
    }

    /**
     * Reset entire simulation
     */
    async resetSimulation() {
        this.physics.reset();
        await this.particles.reset();
        this.camera.reset();
        this.tracers = [];
        this.isPlaying = true;
        this.isReversed = false;
        this.timeSpeed = 1e10;
        this.ui.showNotification('Simulation reset');
    }

    /**
     * Toggle UI collapsed state
     */
    toggleUI() {
        this.ui.toggleCollapsed();
    }

    /**
     * Toggle grid display
     */
    toggleGrid() {
        this.showGrid = !this.showGrid;
        document.getElementById('toggle-grid')?.classList.toggle('active', this.showGrid);
    }

    /**
     * Toggle velocity vectors
     */
    toggleVelocities() {
        this.showVelocities = !this.showVelocities;
        document.getElementById('toggle-velocity')?.classList.toggle('active', this.showVelocities);
    }

    /**
     * Toggle cluster markers
     */
    toggleClusters() {
        this.showClusters = !this.showClusters;
        this.ui.showNotification(this.showClusters ? 'Cluster markers ON' : 'Cluster markers OFF');
    }

    /**
     * Cycle through future scenarios
     */
    cycleFutureScenario() {
        const scenarios = Object.keys(FUTURE_SCENARIOS);
        const currentIndex = scenarios.indexOf(this.futureScenario);
        this.futureScenario = scenarios[(currentIndex + 1) % scenarios.length];

        // Update physics with new w parameter
        this.physics.cosmology.w = FUTURE_SCENARIOS[this.futureScenario].w;

        this.ui.showNotification('Future: ' + FUTURE_SCENARIOS[this.futureScenario].name);
    }

    /**
     * Toggle tracer mode
     */
    toggleTracerMode() {
        this.tracerMode = !this.tracerMode;
        if (!this.tracerMode) {
            this.tracers = [];
        }
        this.ui.showNotification(this.tracerMode ? 'Tracer mode ON - click particles' : 'Tracer mode OFF');
    }

    /**
     * Select particle for tracer
     */
    selectParticleForTracer(screenX, screenY) {
        if (this.tracers.length >= this.maxTracers) {
            this.ui.showNotification('Max tracers reached');
            return;
        }

        const p = this.particles.particles;
        const n = this.particles.count;

        let closestDist = Infinity;
        let closestIdx = -1;

        // Find closest particle to click
        for (let i = 0; i < n; i += 100) {
            const projected = this.camera.project(p.x[i], p.y[i], p.z[i]);
            if (!projected.visible) continue;

            const dist = Math.hypot(projected.x - screenX, projected.y - screenY);
            if (dist < closestDist) {
                closestDist = dist;
                closestIdx = i;
            }
        }

        if (closestDist < 50 && closestIdx >= 0) {
            this.tracers.push({
                particleIndex: closestIdx,
                trail: []
            });
            this.ui.showNotification(`Tracer added (#${this.tracers.length})`);
        }
    }

    /**
     * Add bookmark at current time
     */
    addBookmark() {
        const bookmark = {
            time: this.physics.cosmology.time,
            epoch: this.physics.cosmology.currentEpoch.shortName,
            label: this.ui.formatTimeShort(this.physics.cosmology.time)
        };

        this.bookmarks.push(bookmark);
        this.ui.addBookmark(bookmark, this.bookmarks.length - 1, (idx) => this.jumpToBookmark(idx));
        this.ui.showNotification('Bookmark added');
    }

    /**
     * Jump to bookmark
     */
    jumpToBookmark(index) {
        if (index >= 0 && index < this.bookmarks.length) {
            this.physics.cosmology.jumpToTime(this.bookmarks[index].time);
            this.ui.showNotification('Jumped to bookmark');
        }
    }

    /**
     * Take screenshot
     */
    takeScreenshot() {
        // Flash effect
        const flash = document.getElementById('screenshot-flash');
        if (flash) {
            flash.classList.add('flash');
            setTimeout(() => flash.classList.remove('flash'), 100);
        }

        // Create combined canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvasMain.width;
        tempCanvas.height = this.canvasMain.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.drawImage(this.canvasMain, 0, 0);
        tempCtx.drawImage(this.canvasEffects, 0, 0);

        // Download
        const link = document.createElement('a');
        link.download = `universe_sim_${Date.now()}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();

        this.ui.showNotification('Screenshot saved');
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Show zoom indicator
     */
    showZoomIndicator() {
        const indicator = document.getElementById('zoom-indicator');
        const fill = document.getElementById('zoom-fill');
        const value = document.getElementById('zoom-value');

        if (!indicator || !fill || !value) return;

        // Calculate zoom percentage (0.1 to 100 range mapped to 0-100%)
        const minZoom = 0.1;
        const maxZoom = 100;
        const logMin = Math.log10(minZoom);
        const logMax = Math.log10(maxZoom);
        const logCurrent = Math.log10(this.camera.zoom);
        const percentage = ((logCurrent - logMin) / (logMax - logMin)) * 100;

        fill.style.width = Math.max(0, Math.min(100, percentage)) + '%';
        value.textContent = this.camera.zoom.toFixed(1) + 'x';

        indicator.classList.add('visible');

        // Clear existing timer
        if (this.zoomIndicatorTimer) {
            clearTimeout(this.zoomIndicatorTimer);
        }

        // Hide after delay
        this.zoomIndicatorTimer = setTimeout(() => {
            indicator.classList.remove('visible');
        }, 1500);
    }

    /**
     * Show gesture indicator
     */
    showGestureIndicator(type) {
        const indicator = document.getElementById('gesture-indicator');
        const icon = document.getElementById('gesture-icon');
        const text = document.getElementById('gesture-text');

        if (!indicator || !icon || !text) return;

        const gestures = {
            pan: { icon: '👆', text: 'Panning' },
            zoom: { icon: '🤏', text: 'Zooming' },
            rotate: { icon: '🔄', text: 'Rotating' },
            pinch: { icon: '🤏', text: 'Pinch Zoom' }
        };

        const gesture = gestures[type];
        if (!gesture) return;

        icon.textContent = gesture.icon;
        text.textContent = gesture.text;
        indicator.classList.add('visible');

        // Clear existing timer
        if (this.gestureIndicatorTimer) {
            clearTimeout(this.gestureIndicatorTimer);
        }

        // Hide after delay
        this.gestureIndicatorTimer = setTimeout(() => {
            indicator.classList.remove('visible');
        }, 800);
    }

    /**
     * Hide gesture indicator
     */
    hideGestureIndicator() {
        const indicator = document.getElementById('gesture-indicator');
        if (indicator) {
            indicator.classList.remove('visible');
        }
    }

    /**
     * Setup touch hint (shows on first load, hides after interaction)
     */
    setupTouchHint() {
        const hint = document.getElementById('touch-hint');
        if (!hint) return;

        // Check if touch device
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            // Check if user has seen hint before
            const hintSeen = localStorage.getItem('touchHintSeen');
            if (!hintSeen) {
                // Show hint after a short delay
                setTimeout(() => {
                    hint.classList.add('visible');

                    // Hide after 5 seconds
                    setTimeout(() => {
                        hint.classList.remove('visible');
                        localStorage.setItem('touchHintSeen', 'true');
                    }, 5000);
                }, 2000);
            }

            // Hide on any touch
            document.addEventListener('touchstart', () => {
                hint.classList.remove('visible');
                localStorage.setItem('touchHintSeen', 'true');
            }, { once: true });
        }
    }
}

export default Simulator;
