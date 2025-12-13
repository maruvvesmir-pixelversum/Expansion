/**
 * UI Manager
 * Universe Evolution Simulator v2.47.3
 *
 * Handles all UI updates and DOM interactions
 */

import { EPOCHS } from '../data/epochs.js';
import { UNITS } from '../utils/constants.js';

export class UIManager {
    constructor() {
        // DOM element cache
        this.elements = {};

        // UI state
        this.collapsed = false;
        this.showHelp = false;
        this.showSettings = false;

        // Graphs
        this.fpsHistory = new Array(60).fill(60);

        // Cache element references
        this.cacheElements();
    }

    /**
     * Cache frequently accessed DOM elements
     */
    cacheElements() {
        const ids = [
            // Header
            'session-id', 'fps-counter', 'particle-count',
            'status-physics', 'status-render',

            // Temporal
            'current-time', 'current-epoch', 'redshift', 'scale-factor', 'lookback-time',

            // Cosmological
            'universe-size', 'hubble-rate', 'cmb-temp', 'density', 'expansion-rate',

            // Particles
            'total-particles', 'visible-particles', 'cluster-count',
            'clustered-particles', 'avg-temp',
            'blue-pct', 'white-pct', 'yellow-pct', 'red-pct',

            // Physics
            'timestep', 'theta-value', 'energy-drift', 'virial-ratio',

            // Thermodynamics
            'temp-min', 'temp-max', 'temp-median', 'luminosity', 'entropy',

            // Density
            'mean-density', 'overdensity', 'sigma8', 'jeans-length', 'topology',

            // Camera
            'camera-pos', 'camera-zoom', 'camera-rot', 'camera-fov', 'view-scale',

            // Performance
            'perf-fps', 'frame-time', 'physics-time', 'render-time', 'effects-time',
            'gpu-bar', 'mem-bar',

            // Effects
            'fx-bloom', 'fx-motion', 'fx-grain', 'fx-vignette', 'fx-web',

            // Future
            'future-mode', 'future-w', 'future-status', 'future-desc', 'eos-param',

            // Timeline
            'timeline-progress', 'timeline-marker',
            'time-display', 'epoch-display', 'speed-display',

            // Collapsed UI
            'collapsed-time', 'collapsed-epoch', 'collapsed-fps',
            'collapsed-particles', 'collapsed-speed',

            // Modals/Panels
            'epoch-info', 'epoch-title', 'epoch-time-range', 'epoch-description',
            'settings-panel', 'help-modal',
            'notification',
            'tracer-panel', 'tracer-count',

            // Graphs
            'graph-scale', 'graph-temp', 'graph-fps',
            'temp-histogram',

            // Bookmarks
            'bookmarks-list',

            // Loading
            'loading', 'loading-progress', 'loading-status'
        ];

        for (const id of ids) {
            this.elements[id] = document.getElementById(id);
        }
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        const now = new Date();
        const id = `SIM_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
        this.setText('session-id', id);
        return id;
    }

    /**
     * Set text content of element
     */
    setText(id, text) {
        const el = this.elements[id];
        if (el) el.textContent = text;
    }

    /**
     * Set style of element
     */
    setStyle(id, property, value) {
        const el = this.elements[id];
        if (el) el.style[property] = value;
    }

    /**
     * Update loading screen
     */
    updateLoading(status, progress) {
        this.setText('loading-status', status);
        this.setStyle('loading-progress', 'width', progress + '%');
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
        const el = this.elements['loading'];
        if (el) el.classList.add('hidden');
    }

    /**
     * Update all UI elements
     */
    update(state) {
        this.updateTemporal(state);
        this.updateCosmological(state);
        this.updateParticles(state);
        this.updatePhysics(state);
        this.updatePerformance(state);
        this.updateCamera(state);
        this.updateTimeline(state);
        this.updateCollapsedUI(state);
    }

    /**
     * Update temporal navigation section
     */
    updateTemporal(state) {
        this.setText('current-time', this.formatTime(state.time));
        this.setText('current-epoch', state.epoch?.name ?? 'Unknown');
        this.setText('redshift', state.redshift > 1e10 ? '∞' : state.redshift.toFixed(4));
        this.setText('scale-factor',
            state.scaleFactor > 1e-10 ?
            state.scaleFactor.toFixed(6) :
            state.scaleFactor.toExponential(3)
        );
        this.setText('lookback-time', this.formatTime(state.lookbackTime));
    }

    /**
     * Update cosmological state section
     */
    updateCosmological(state) {
        this.setText('universe-size', state.epoch?.size ?? 'N/A');
        this.setText('hubble-rate', state.hubbleRate?.toFixed(2) + ' km/s/Mpc' ?? 'N/A');
        this.setText('cmb-temp', this.formatTemperature(state.temperature));
        this.setText('density', this.formatDensity(state.density));
        this.setText('expansion-rate', state.expansionState ?? 'N/A');
    }

    /**
     * Update particle system section
     */
    updateParticles(state) {
        this.setText('total-particles', state.particleCount?.toLocaleString() ?? '0');
        this.setText('visible-particles', state.visibleParticles?.toLocaleString() ?? '0');
        this.setText('cluster-count', state.clusterCount?.toString() ?? '0');
        this.setText('clustered-particles', (state.clusteredPercent?.toFixed(1) ?? '0') + '%');
        this.setText('avg-temp', this.formatTemperature(state.avgTemperature));

        // Color distribution
        if (state.colorDistribution) {
            this.setText('blue-pct', state.colorDistribution.blue.toFixed(1) + '%');
            this.setText('white-pct', state.colorDistribution.white.toFixed(1) + '%');
            this.setText('yellow-pct', state.colorDistribution.yellow.toFixed(1) + '%');
            this.setText('red-pct', state.colorDistribution.red.toFixed(1) + '%');
        }
    }

    /**
     * Update physics engine section
     */
    updatePhysics(state) {
        this.setText('timestep', state.timestep ?? 'Adaptive');
        this.setText('theta-value', state.theta?.toFixed(2) ?? '0.50');
        this.setText('energy-drift', (state.energyDrift?.toFixed(4) ?? '0.0000') + '%');
        this.setText('virial-ratio', '2T/|U| = ' + (state.virialRatio?.toFixed(2) ?? '0.00'));
    }

    /**
     * Update performance section
     */
    updatePerformance(state) {
        this.setText('fps-counter', (state.fps?.toFixed(0) ?? '0') + ' FPS');
        this.setText('particle-count', (state.particleCount / 1000).toFixed(0) + 'k particles');

        this.setText('perf-fps', state.fps?.toFixed(1) ?? '0');
        this.setText('frame-time', (state.frameTime?.toFixed(1) ?? '0') + ' ms');
        this.setText('physics-time', (state.physicsTime?.toFixed(1) ?? '0') + ' ms');
        this.setText('render-time', (state.renderTime?.toFixed(1) ?? '0') + ' ms');
        this.setText('effects-time', (state.effectsTime?.toFixed(1) ?? '0') + ' ms');

        // Update FPS history
        if (state.fps) {
            this.fpsHistory.push(state.fps);
            this.fpsHistory.shift();
        }
    }

    /**
     * Update camera section
     */
    updateCamera(state) {
        if (state.camera) {
            this.setText('camera-pos', state.camera.position ?
                `(${state.camera.position.x.toFixed(0)}, ${state.camera.position.y.toFixed(0)}, ${state.camera.position.z.toFixed(0)})` :
                '(0, 0, 100)'
            );
            this.setText('camera-zoom', state.camera.zoom ?? '1.00x');
            this.setText('camera-rot', state.camera.rotation ?
                `(${state.camera.rotation.x}, ${state.camera.rotation.y})` :
                "(0°, 0°)"
            );
            this.setText('view-scale', state.camera.viewScale ?? '1 Mpc');
        }
    }

    /**
     * Update timeline section
     */
    updateTimeline(state) {
        const progress = state.timelineProgress ?? 0;
        this.setStyle('timeline-progress', 'width', progress + '%');
        this.setStyle('timeline-marker', 'left', progress + '%');

        this.setText('time-display', 't = ' + this.formatTime(state.time));
        this.setText('epoch-display', state.epoch?.shortName?.toUpperCase() ?? 'PLANCK');
        this.setText('speed-display', 'Speed: ×' + this.formatSpeed(state.timeSpeed));
    }

    /**
     * Update collapsed UI bar
     */
    updateCollapsedUI(state) {
        this.setText('collapsed-time', this.formatTimeShort(state.time));
        this.setText('collapsed-epoch', state.epoch?.shortName ?? 'Planck');
        this.setText('collapsed-fps', state.fps?.toFixed(0) ?? '0');
        this.setText('collapsed-particles', (state.particleCount / 1000).toFixed(0) + 'k');
        this.setText('collapsed-speed', '×' + this.formatSpeed(state.timeSpeed));
    }

    /**
     * Update effects status
     */
    updateEffects(effects) {
        this.setText('fx-bloom', effects.bloom ? 'ON' : 'OFF');
        this.setText('fx-motion', effects.motionBlur ? 'ON' : 'OFF');
        this.setText('fx-grain', effects.filmGrain ? 'ON' : 'OFF');
        this.setText('fx-vignette', effects.vignette ? 'ON' : 'OFF');
        this.setText('fx-web', effects.cosmicWeb ? 'ON' : 'OFF');
    }

    /**
     * Update future scenario
     */
    updateFutureScenario(scenario) {
        this.setText('future-mode', scenario.name);
        this.setText('future-w', 'w = ' + scenario.w.toFixed(1));
        this.setText('future-desc', scenario.description);
    }

    /**
     * Show epoch info popup
     */
    showEpochInfo(epoch) {
        const el = this.elements['epoch-info'];
        if (!el) return;

        this.setText('epoch-title', epoch.name);
        this.setText('epoch-time-range', epoch.timeRange);
        this.setText('epoch-description', epoch.description);

        el.classList.add('visible');

        setTimeout(() => el.classList.remove('visible'), 4000);
    }

    /**
     * Show notification toast
     */
    showNotification(message, duration = 2000) {
        const el = this.elements['notification'];
        if (!el) return;

        el.textContent = message;
        el.classList.add('visible');

        setTimeout(() => el.classList.remove('visible'), duration);
    }

    /**
     * Toggle UI collapsed state
     */
    toggleCollapsed() {
        this.collapsed = !this.collapsed;
        document.body.classList.toggle('ui-collapsed', this.collapsed);
        return this.collapsed;
    }

    /**
     * Toggle help modal
     */
    toggleHelp() {
        this.showHelp = !this.showHelp;
        const el = this.elements['help-modal'];
        if (el) el.classList.toggle('visible', this.showHelp);
        return this.showHelp;
    }

    /**
     * Toggle settings panel
     */
    toggleSettings() {
        this.showSettings = !this.showSettings;
        const el = this.elements['settings-panel'];
        if (el) el.classList.toggle('visible', this.showSettings);
        return this.showSettings;
    }

    /**
     * Update tracer panel
     */
    updateTracerPanel(tracerMode, tracerCount, maxTracers) {
        const el = this.elements['tracer-panel'];
        if (el) {
            if (tracerMode) {
                el.classList.add('visible');
                this.setText('tracer-count', `${tracerCount}/${maxTracers} particles`);
            } else {
                el.classList.remove('visible');
            }
        }
    }

    /**
     * Initialize histogram bars
     */
    initHistogram() {
        const container = this.elements['temp-histogram'];
        if (!container) return;

        container.innerHTML = '';
        for (let i = 0; i < 20; i++) {
            const bar = document.createElement('div');
            bar.className = 'histogram-bar';
            bar.style.height = (20 + Math.random() * 80) + '%';
            container.appendChild(bar);
        }
    }

    /**
     * Update histogram
     */
    updateHistogram(frameCount) {
        const bars = document.querySelectorAll('#temp-histogram .histogram-bar');
        bars.forEach((bar, i) => {
            const baseHeight = 20;
            const variation = Math.sin(frameCount * 0.02 + i * 0.5) * 30 + 50;
            bar.style.height = (baseHeight + variation) + '%';
        });
    }

    /**
     * Initialize epoch markers on timeline
     */
    initEpochMarkers() {
        const container = document.getElementById('epoch-markers');
        if (!container) return;

        const presentTime = 13.798 * UNITS.Gyr_to_s;
        const futureTime = presentTime * 10;

        EPOCHS.forEach(epoch => {
            if (epoch.timeStart > 0) {
                const progress = (epoch.timeStart / futureTime) * 100;
                const marker = document.createElement('div');
                marker.className = 'epoch-marker';
                marker.style.left = progress + '%';
                container.appendChild(marker);
            }
        });
    }

    /**
     * Update graphs
     */
    updateGraphs(scaleHistory, tempHistory) {
        this.updateLineGraph('graph-scale', scaleHistory, '#555');
        this.updateLineGraph('graph-temp', tempHistory, '#666');
        this.updateBarGraph('graph-fps', this.fpsHistory, 120);
    }

    /**
     * Draw a line graph on canvas
     */
    updateLineGraph(canvasId, data, color) {
        const canvas = this.elements[canvasId];
        if (!canvas) return;

        const parent = canvas.parentElement;
        if (!parent) return;

        const ctx = canvas.getContext('2d');
        const w = canvas.width = parent.clientWidth;
        const h = canvas.height = 40;

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        for (let i = 0; i < data.length; i++) {
            const x = (i / data.length) * w;
            const y = h - ((data[i] - min) / range) * (h - 4) - 2;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    /**
     * Draw a bar graph on canvas
     */
    updateBarGraph(canvasId, data, maxValue) {
        const canvas = this.elements[canvasId];
        if (!canvas) return;

        const parent = canvas.parentElement;
        if (!parent) return;

        const ctx = canvas.getContext('2d');
        const w = canvas.width = parent.clientWidth;
        const h = canvas.height = 40;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#333';

        for (let i = 0; i < data.length; i++) {
            const x = (i / data.length) * w;
            const barH = (data[i] / maxValue) * h;
            ctx.fillRect(x, h - barH, w / data.length - 1, barH);
        }
    }

    /**
     * Add bookmark to list
     */
    addBookmark(bookmark, index, jumpCallback) {
        const list = this.elements['bookmarks-list'];
        if (!list) return;

        if (index === 0) {
            list.innerHTML = '';
        }

        const item = document.createElement('div');
        item.className = 'bookmark-item';
        item.innerHTML = `
            <span>${bookmark.epoch} - ${bookmark.label}</span>
            <span class="bookmark-jump">JUMP</span>
        `;
        item.querySelector('.bookmark-jump').addEventListener('click', () => jumpCallback(index));
        list.appendChild(item);
    }

    /**
     * Format time for display
     */
    formatTime(seconds) {
        if (seconds === undefined || seconds === null) return '0.000 s';
        if (seconds < 1e-40) return '0.000 s';
        if (seconds < 1e-30) return seconds.toExponential(2) + ' s';
        if (seconds < 1e-6) return (seconds * 1e6).toFixed(2) + ' μs';
        if (seconds < 1) return (seconds * 1000).toFixed(2) + ' ms';
        if (seconds < 60) return seconds.toFixed(2) + ' s';
        if (seconds < 3600) return (seconds / 60).toFixed(1) + ' min';
        if (seconds < 86400) return (seconds / 3600).toFixed(1) + ' hr';
        if (seconds < 31536000) return (seconds / 86400).toFixed(1) + ' days';
        if (seconds < 3.156e10) return (seconds / 31536000).toFixed(1) + ' yr';
        if (seconds < 3.156e13) return (seconds / 3.156e10).toFixed(2) + ' kyr';
        if (seconds < 3.156e16) return (seconds / 3.156e13).toFixed(2) + ' Myr';
        return (seconds / 3.156e16).toFixed(2) + ' Gyr';
    }

    /**
     * Format time in short form
     */
    formatTimeShort(seconds) {
        if (!seconds) return '0';
        if (seconds < 1) return seconds.toExponential(0);
        if (seconds < 3.156e10) return (seconds / 31536000).toFixed(0) + 'y';
        if (seconds < 3.156e13) return (seconds / 3.156e10).toFixed(0) + 'ky';
        if (seconds < 3.156e16) return (seconds / 3.156e13).toFixed(1) + 'My';
        return (seconds / 3.156e16).toFixed(1) + 'Gy';
    }

    /**
     * Format temperature for display
     */
    formatTemperature(temp) {
        if (temp === undefined || temp === null) return 'N/A';
        if (temp > 1e20) return temp.toExponential(2) + ' K';
        if (temp > 1e6) return (temp / 1e6).toFixed(1) + ' MK';
        if (temp > 1000) return (temp / 1000).toFixed(1) + ' kK';
        return temp.toFixed(1) + ' K';
    }

    /**
     * Format density for display
     */
    formatDensity(rho) {
        if (rho === undefined || rho === null) return 'N/A';
        return rho.toExponential(2) + ' kg/m³';
    }

    /**
     * Format speed multiplier
     */
    formatSpeed(speed) {
        if (!speed) return '1';
        if (speed >= 1e15) return '10¹⁵';
        if (speed >= 1e12) return '10¹²';
        if (speed >= 1e9) return '10⁹';
        if (speed >= 1e6) return '10⁶';
        if (speed >= 1e3) return '10³';
        return speed.toFixed(0);
    }
}

export default UIManager;
