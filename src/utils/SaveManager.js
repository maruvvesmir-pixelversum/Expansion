/**
 * Save/Load Manager
 * Universe Evolution Simulator v2.47.3
 *
 * Handles saving and loading simulation state
 * Supports local storage, file export/import, and auto-save
 */

const SAVE_VERSION = '2.47.3';
const STORAGE_KEY = 'universe_sim_saves';
const AUTOSAVE_KEY = 'universe_sim_autosave';

export class SaveManager {
    constructor(simulator) {
        this.simulator = simulator;
        this.maxSaveSlots = 10;
        this.autoSaveInterval = null;
        this.autoSaveEnabled = false;
        this.autoSaveFrequency = 60000; // 1 minute
        this.lastSaveTime = 0;
    }

    /**
     * Create a save object from current simulation state
     */
    createSaveData() {
        const sim = this.simulator;
        const cosmo = sim.physics.cosmology;
        const particles = sim.particles;

        // Sample particle data (save a subset for file size)
        const particleSampleRate = Math.max(1, Math.floor(particles.count / 10000));
        const sampledParticles = this.sampleParticles(particles, particleSampleRate);

        return {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            metadata: {
                name: '',
                description: '',
                epoch: cosmo.currentEpoch?.name || 'Unknown',
                cosmicTime: cosmo.time,
                particleCount: particles.count
            },
            simulation: {
                isPlaying: sim.isPlaying,
                isReversed: sim.isReversed,
                timeSpeed: sim.timeSpeed,
                frameCount: sim.frameCount,
                futureScenario: sim.futureScenario
            },
            cosmology: {
                time: cosmo.time,
                scaleFactor: cosmo.scaleFactor,
                redshift: cosmo.redshift,
                temperature: cosmo.temperature,
                H0: cosmo.H0,
                Omega_Lambda: cosmo.Omega_Lambda,
                Omega_m: cosmo.Omega_m,
                Omega_b: cosmo.Omega_b,
                Omega_DM: cosmo.Omega_DM,
                Omega_r: cosmo.Omega_r,
                Omega_k: cosmo.Omega_k,
                w: cosmo.w,
                n_s: cosmo.n_s,
                sigma_8: cosmo.sigma_8
            },
            particles: {
                count: particles.count,
                sampleRate: particleSampleRate,
                data: sampledParticles,
                stats: particles.stats,
                clusterCount: particles.clusterCount
            },
            camera: {
                x: sim.camera.x,
                y: sim.camera.y,
                z: sim.camera.z,
                rotationX: sim.camera.rotationX,
                rotationY: sim.camera.rotationY,
                rotationZ: sim.camera.rotationZ,
                zoom: sim.camera.zoom,
                fov: sim.camera.fov
            },
            visual: {
                showGrid: sim.showGrid,
                showVelocities: sim.showVelocities,
                showClusters: sim.showClusters,
                effects: { ...sim.renderer.effects }
            },
            tracers: sim.tracers.map(t => ({
                particleIndex: t.particleIndex,
                trailLength: t.trail.length
            })),
            bookmarks: [...sim.bookmarks]
        };
    }

    /**
     * Sample particle data for saving
     */
    sampleParticles(particles, sampleRate) {
        const p = particles.particles;
        const n = particles.count;
        const sampled = {
            x: [], y: [], z: [],
            vx: [], vy: [], vz: [],
            mass: [], temperature: [], age: [],
            colorR: [], colorG: [], colorB: [],
            brightness: [], size: []
        };

        for (let i = 0; i < n; i += sampleRate) {
            sampled.x.push(p.x[i]);
            sampled.y.push(p.y[i]);
            sampled.z.push(p.z[i]);
            sampled.vx.push(p.vx[i]);
            sampled.vy.push(p.vy[i]);
            sampled.vz.push(p.vz[i]);
            sampled.mass.push(p.mass[i]);
            sampled.temperature.push(p.temperature[i]);
            sampled.age.push(p.age[i]);
            sampled.colorR.push(p.colorR[i]);
            sampled.colorG.push(p.colorG[i]);
            sampled.colorB.push(p.colorB[i]);
            sampled.brightness.push(p.brightness[i]);
            sampled.size.push(p.size[i]);
        }

        return sampled;
    }

    /**
     * Restore simulation state from save data
     */
    async loadSaveData(saveData) {
        if (!saveData || !saveData.version) {
            throw new Error('Invalid save data');
        }

        const sim = this.simulator;
        const cosmo = sim.physics.cosmology;

        // Restore cosmology state
        if (saveData.cosmology) {
            cosmo.time = saveData.cosmology.time;
            cosmo.scaleFactor = saveData.cosmology.scaleFactor;
            cosmo.redshift = saveData.cosmology.redshift;
            cosmo.temperature = saveData.cosmology.temperature;
            cosmo.H0 = saveData.cosmology.H0;
            cosmo.Omega_Lambda = saveData.cosmology.Omega_Lambda;
            cosmo.Omega_m = saveData.cosmology.Omega_m;
            cosmo.Omega_b = saveData.cosmology.Omega_b;
            cosmo.Omega_DM = saveData.cosmology.Omega_DM;
            cosmo.Omega_r = saveData.cosmology.Omega_r;
            cosmo.Omega_k = saveData.cosmology.Omega_k;
            cosmo.w = saveData.cosmology.w;
            cosmo.n_s = saveData.cosmology.n_s ?? cosmo.n_s;
            cosmo.sigma_8 = saveData.cosmology.sigma_8 ?? cosmo.sigma_8;
            cosmo.update(0); // Update epoch
        }

        // Restore particle state (interpolate from sampled data)
        if (saveData.particles?.data) {
            await this.restoreParticles(sim.particles, saveData.particles);
        }

        // Restore simulation state
        if (saveData.simulation) {
            sim.isPlaying = saveData.simulation.isPlaying;
            sim.isReversed = saveData.simulation.isReversed;
            sim.timeSpeed = saveData.simulation.timeSpeed;
            sim.frameCount = saveData.simulation.frameCount;
            sim.futureScenario = saveData.simulation.futureScenario || 'freeze';
        }

        // Restore camera state
        if (saveData.camera) {
            sim.camera.x = saveData.camera.x;
            sim.camera.y = saveData.camera.y;
            sim.camera.z = saveData.camera.z;
            sim.camera.rotationX = saveData.camera.rotationX;
            sim.camera.rotationY = saveData.camera.rotationY;
            sim.camera.rotationZ = saveData.camera.rotationZ;
            sim.camera.zoom = saveData.camera.zoom;
            sim.camera.targetZoom = saveData.camera.zoom;
            sim.camera.fov = saveData.camera.fov;
            sim.camera.needsUpdate = true;
        }

        // Restore visual settings
        if (saveData.visual) {
            sim.showGrid = saveData.visual.showGrid;
            sim.showVelocities = saveData.visual.showVelocities;
            sim.showClusters = saveData.visual.showClusters;
            if (saveData.visual.effects) {
                Object.assign(sim.renderer.effects, saveData.visual.effects);
            }
        }

        // Restore tracers
        sim.tracers = (saveData.tracers || []).map(t => ({
            particleIndex: t.particleIndex,
            trail: []
        }));

        // Restore bookmarks
        sim.bookmarks = saveData.bookmarks || [];

        return true;
    }

    /**
     * Restore particle data from sampled save
     */
    async restoreParticles(particles, savedParticles) {
        const data = savedParticles.data;
        const sampleRate = savedParticles.sampleRate || 1;
        const p = particles.particles;
        const n = particles.count;

        // Interpolate particle data from samples
        const sampledCount = data.x.length;

        for (let i = 0; i < n; i++) {
            // Find nearest sample
            const sampleIdx = Math.min(Math.floor(i / sampleRate), sampledCount - 1);
            const nextIdx = Math.min(sampleIdx + 1, sampledCount - 1);
            const t = (i % sampleRate) / sampleRate;

            // Interpolate position
            p.x[i] = this.lerp(data.x[sampleIdx], data.x[nextIdx], t);
            p.y[i] = this.lerp(data.y[sampleIdx], data.y[nextIdx], t);
            p.z[i] = this.lerp(data.z[sampleIdx], data.z[nextIdx], t);

            // Add small random offset to avoid clumping
            const jitter = 0.5;
            p.x[i] += (Math.random() - 0.5) * jitter;
            p.y[i] += (Math.random() - 0.5) * jitter;
            p.z[i] += (Math.random() - 0.5) * jitter;

            // Interpolate velocity
            p.vx[i] = this.lerp(data.vx[sampleIdx], data.vx[nextIdx], t);
            p.vy[i] = this.lerp(data.vy[sampleIdx], data.vy[nextIdx], t);
            p.vz[i] = this.lerp(data.vz[sampleIdx], data.vz[nextIdx], t);

            // Copy properties from nearest sample
            p.mass[i] = data.mass[sampleIdx] * (0.8 + Math.random() * 0.4);
            p.temperature[i] = data.temperature[sampleIdx] * (0.9 + Math.random() * 0.2);
            p.age[i] = data.age[sampleIdx];

            // Colors
            p.colorR[i] = data.colorR[sampleIdx];
            p.colorG[i] = data.colorG[sampleIdx];
            p.colorB[i] = data.colorB[sampleIdx];
            p.brightness[i] = data.brightness[sampleIdx];
            p.size[i] = data.size[sampleIdx];
        }

        // Restore stats if available
        if (savedParticles.stats) {
            particles.stats = { ...particles.stats, ...savedParticles.stats };
        }
        particles.clusterCount = savedParticles.clusterCount || 0;

        // Update colors based on temperature
        particles.updateColors();
    }

    /**
     * Linear interpolation
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Save to local storage slot
     */
    saveToSlot(slotIndex, name = '') {
        const saves = this.getSaveSlots();
        const saveData = this.createSaveData();

        saveData.metadata.name = name || `Save ${slotIndex + 1}`;
        saveData.metadata.slotIndex = slotIndex;

        saves[slotIndex] = saveData;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
            this.lastSaveTime = Date.now();
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    }

    /**
     * Load from local storage slot
     */
    async loadFromSlot(slotIndex) {
        const saves = this.getSaveSlots();
        const saveData = saves[slotIndex];

        if (!saveData) {
            throw new Error('Save slot is empty');
        }

        return await this.loadSaveData(saveData);
    }

    /**
     * Get all save slots
     */
    getSaveSlots() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : new Array(this.maxSaveSlots).fill(null);
        } catch (e) {
            console.error('Failed to load save slots:', e);
            return new Array(this.maxSaveSlots).fill(null);
        }
    }

    /**
     * Delete save slot
     */
    deleteSlot(slotIndex) {
        const saves = this.getSaveSlots();
        saves[slotIndex] = null;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
            return true;
        } catch (e) {
            console.error('Failed to delete save:', e);
            return false;
        }
    }

    /**
     * Export save to file
     */
    exportToFile(filename = null) {
        const saveData = this.createSaveData();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const epochName = (saveData.metadata.epoch || 'unknown').toLowerCase().replace(/\s+/g, '_');

        filename = filename || `universe_sim_${epochName}_${timestamp}.json`;

        const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);

        return filename;
    }

    /**
     * Import save from file
     */
    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const saveData = JSON.parse(e.target.result);
                    await this.loadSaveData(saveData);
                    resolve(saveData);
                } catch (error) {
                    reject(new Error('Invalid save file: ' + error.message));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Quick save (slot 0)
     */
    quickSave() {
        return this.saveToSlot(0, 'Quick Save');
    }

    /**
     * Quick load (slot 0)
     */
    async quickLoad() {
        return await this.loadFromSlot(0);
    }

    /**
     * Auto-save functionality
     */
    autoSave() {
        try {
            const saveData = this.createSaveData();
            saveData.metadata.name = 'Auto-Save';
            saveData.metadata.isAutoSave = true;

            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saveData));
            this.lastSaveTime = Date.now();
            return true;
        } catch (e) {
            console.error('Auto-save failed:', e);
            return false;
        }
    }

    /**
     * Load auto-save
     */
    async loadAutoSave() {
        try {
            const data = localStorage.getItem(AUTOSAVE_KEY);
            if (!data) {
                throw new Error('No auto-save found');
            }
            const saveData = JSON.parse(data);
            return await this.loadSaveData(saveData);
        } catch (e) {
            throw new Error('Failed to load auto-save: ' + e.message);
        }
    }

    /**
     * Check if auto-save exists
     */
    hasAutoSave() {
        return localStorage.getItem(AUTOSAVE_KEY) !== null;
    }

    /**
     * Start auto-save timer
     */
    startAutoSave(frequency = 60000) {
        this.autoSaveFrequency = frequency;
        this.autoSaveEnabled = true;

        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(() => {
            if (this.autoSaveEnabled && this.simulator.isPlaying) {
                this.autoSave();
            }
        }, this.autoSaveFrequency);
    }

    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        this.autoSaveEnabled = false;
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    /**
     * Get save info for UI display
     */
    getSaveInfo(saveData) {
        if (!saveData) return null;

        return {
            name: saveData.metadata?.name || 'Unnamed',
            timestamp: saveData.timestamp,
            date: new Date(saveData.timestamp).toLocaleString(),
            epoch: saveData.metadata?.epoch || 'Unknown',
            cosmicTime: saveData.metadata?.cosmicTime || 0,
            particleCount: saveData.metadata?.particleCount || 0,
            version: saveData.version
        };
    }

    /**
     * Get formatted save slots for UI
     */
    getFormattedSlots() {
        const saves = this.getSaveSlots();
        return saves.map((save, index) => ({
            index,
            isEmpty: save === null,
            info: this.getSaveInfo(save)
        }));
    }

    /**
     * Clear all saves
     */
    clearAllSaves() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(AUTOSAVE_KEY);
            return true;
        } catch (e) {
            console.error('Failed to clear saves:', e);
            return false;
        }
    }
}

export default SaveManager;
