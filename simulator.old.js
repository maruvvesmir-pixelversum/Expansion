/**
 * Universe Evolution Simulator v2.47.3
 * Complete Physics Engine with Advanced Visual Effects
 * Anthropic Cosmological Research Institute
 */

// ============================================================================
// PHYSICAL CONSTANTS
// ============================================================================
const CONSTANTS = {
    G: 6.674e-11,           // Gravitational constant (m³/kg·s²)
    c: 2.998e8,             // Speed of light (m/s)
    k_B: 1.381e-23,         // Boltzmann constant (J/K)
    sigma: 5.670e-8,        // Stefan-Boltzmann constant (W/m²K⁴)
    h: 6.626e-34,           // Planck constant (J·s)
    hbar: 1.055e-34,        // Reduced Planck constant

    // Planck units
    t_planck: 5.391e-44,    // Planck time (s)
    l_planck: 1.616e-35,    // Planck length (m)
    T_planck: 1.417e32,     // Planck temperature (K)
    m_planck: 2.176e-8,     // Planck mass (kg)

    // Cosmological
    H0: 67.4,               // Hubble constant (km/s/Mpc)
    H0_SI: 2.18e-18,        // Hubble constant (1/s)
    T_CMB_0: 2.725,         // Current CMB temperature (K)

    // Conversion factors
    Mpc_to_m: 3.086e22,     // Megaparsec to meters
    Gyr_to_s: 3.156e16,     // Gigayear to seconds
    ly_to_m: 9.461e15,      // Light year to meters

    // Solar units
    M_sun: 1.989e30,        // Solar mass (kg)
    L_sun: 3.828e26,        // Solar luminosity (W)
};

// ============================================================================
// COSMOLOGICAL PARAMETERS (PLANCK 2018)
// ============================================================================
const COSMOLOGY = {
    Omega_Lambda: 0.6889,   // Dark energy density
    Omega_m: 0.3111,        // Total matter density
    Omega_b: 0.0486,        // Baryonic matter density
    Omega_DM: 0.2625,       // Dark matter density
    Omega_r: 9.24e-5,       // Radiation density
    Omega_k: 0.0,           // Curvature
    w: -1.03,               // Dark energy equation of state
    n_s: 0.9649,            // Spectral index
    sigma_8: 0.811,         // Density fluctuation amplitude
    t_universe: 13.798,     // Age of universe (Gyr)
};

// ============================================================================
// EPOCH DEFINITIONS
// ============================================================================
const EPOCHS = [
    {
        name: "Planck Era",
        shortName: "Planck",
        timeStart: 0,
        timeEnd: 1e-43,
        temperature: 1.417e32,
        description: "Quantum gravity dominates. Space-time foam. All forces unified. Physics as we know it breaks down.",
        timeRange: "t = 0 - 10⁻⁴³ s",
        size: "10⁻³⁵ m",
        color: { r: 255, g: 255, b: 255 },
        particleBlur: 1.0,
        particleJitter: 1.0
    },
    {
        name: "Inflation",
        shortName: "Inflation",
        timeStart: 1e-36,
        timeEnd: 1e-32,
        temperature: 1e27,
        description: "Exponential expansion by factor of 10²⁶. Universe expands faster than light. Quantum fluctuations frozen into density perturbations.",
        timeRange: "t = 10⁻³⁶ - 10⁻³² s",
        size: "~10 cm",
        color: { r: 255, g: 255, b: 255 },
        particleBlur: 0.9,
        particleJitter: 0.8
    },
    {
        name: "Quark-Gluon Plasma",
        shortName: "QGP",
        timeStart: 1e-32,
        timeEnd: 1,
        temperature: 1e12,
        description: "Hot soup of quarks and gluons. Too energetic for protons/neutrons to form. Electromagnetic and weak forces separate.",
        timeRange: "t = 10⁻³² s - 1 s",
        size: "~20 light-years",
        color: { r: 255, g: 200, b: 150 },
        particleBlur: 0.7,
        particleJitter: 0.5
    },
    {
        name: "Nucleosynthesis",
        shortName: "Nucleo",
        timeStart: 180,
        timeEnd: 1200,
        temperature: 1e9,
        description: "First atomic nuclei form: hydrogen, helium, lithium. Determines 75% H, 25% He primordial abundance by mass.",
        timeRange: "t = 3 - 20 minutes",
        size: "~300 light-years",
        color: { r: 255, g: 220, b: 100 },
        particleBlur: 0.5,
        particleJitter: 0.3
    },
    {
        name: "Recombination",
        shortName: "Recomb",
        timeStart: 1.2e13,
        timeEnd: 1.5e13,
        temperature: 3000,
        description: "Electrons bind to nuclei forming neutral atoms. Universe becomes transparent. CMB released - 'Surface of last scattering'.",
        timeRange: "t = 380,000 years",
        size: "84 million light-years",
        color: { r: 255, g: 180, b: 100 },
        particleBlur: 0.3,
        particleJitter: 0.1
    },
    {
        name: "Dark Ages",
        shortName: "Dark",
        timeStart: 1.2e13,
        timeEnd: 6.3e15,
        temperature: 60,
        description: "No stars yet. Gravity slowly pulls matter into dense regions. Universe filled with neutral hydrogen. Very dim period.",
        timeRange: "t = 380k - 200M years",
        size: "9 billion light-years",
        color: { r: 50, g: 20, b: 20 },
        particleBlur: 0.1,
        particleJitter: 0.05
    },
    {
        name: "First Stars",
        shortName: "Stars",
        timeStart: 6.3e15,
        timeEnd: 3.15e16,
        temperature: 10000,
        description: "First stars ignite (Population III). Massive, short-lived blue giants. Reionization begins. First heavy elements forged.",
        timeRange: "t = 200M - 1B years",
        size: "9 billion light-years",
        color: { r: 100, g: 150, b: 255 },
        particleBlur: 0.1,
        particleJitter: 0.02
    },
    {
        name: "Galaxy Formation",
        shortName: "Galaxies",
        timeStart: 3.15e16,
        timeEnd: 2.84e17,
        temperature: 5000,
        description: "Galaxies form and merge. Cosmic web of filaments emerges. Supermassive black holes grow. Peak star formation era.",
        timeRange: "t = 1 - 9 Gyr",
        size: "60 billion light-years",
        color: { r: 255, g: 220, b: 180 },
        particleBlur: 0.05,
        particleJitter: 0.01
    },
    {
        name: "Dark Energy Era",
        shortName: "DarkE",
        timeStart: 2.84e17,
        timeEnd: 4.35e17,
        temperature: 2.725,
        description: "Dark energy dominates. Cosmic expansion accelerates. Large-scale structures established. Approaching present day.",
        timeRange: "t = 9 - 13.8 Gyr",
        size: "93 billion light-years",
        color: { r: 200, g: 180, b: 150 },
        particleBlur: 0.0,
        particleJitter: 0.0
    },
    {
        name: "Present Day",
        shortName: "Now",
        timeStart: 4.35e17,
        timeEnd: 4.35e17,
        temperature: 2.725,
        description: "Current era. Observable universe spans 93 billion light-years. Contains ~2 trillion galaxies and countless stars.",
        timeRange: "t = 13.8 Gyr",
        size: "93 billion light-years",
        color: { r: 200, g: 180, b: 150 },
        particleBlur: 0.0,
        particleJitter: 0.0
    }
];

// Future scenarios
const FUTURE_SCENARIOS = {
    freeze: {
        name: "Big Freeze",
        description: "Eternal expansion. Heat death. All stars die. Maximum entropy. Universe fades to darkness over 10^100 years.",
        w: -1.0
    },
    rip: {
        name: "Big Rip",
        description: "Phantom energy tears apart all structures. Galaxies, stars, planets, atoms - all ripped apart at finite time (~22 Gyr).",
        w: -1.5
    },
    crunch: {
        name: "Big Crunch",
        description: "Expansion reverses. Universe collapses back to singularity. Temperature rises. Time runs backward toward new Big Bang.",
        w: -0.5
    },
    bounce: {
        name: "Big Bounce",
        description: "Cyclic universe. Crunch followed by new Big Bang. Infinite cycles of expansion and contraction. New universe each time.",
        w: -0.5
    }
};

// ============================================================================
// MAIN SIMULATOR CLASS
// ============================================================================
class UniverseSimulator {
    constructor() {
        // Canvas layers
        this.canvasMain = document.getElementById('canvas-main');
        this.canvasEffects = document.getElementById('canvas-effects');
        this.canvasUI = document.getElementById('canvas-ui');

        this.ctxMain = this.canvasMain.getContext('2d');
        this.ctxEffects = this.canvasEffects.getContext('2d');
        this.ctxUI = this.canvasUI.getContext('2d');

        // Simulation state
        this.time = 0;
        this.timeSpeed = 1e10;
        this.isPlaying = true;
        this.isReversed = false;

        // Camera
        this.camera = {
            x: 0,
            y: 0,
            z: 100,
            zoom: 1,
            rotationX: 0,
            rotationY: 0,
            targetZoom: 1,
            fov: 60
        };

        // Particles
        this.particleCount = 500000;
        this.particles = null;
        this.particleSizeMultiplier = 1.0;

        // Cosmology state
        this.scaleFactor = 1e-30;
        this.temperature = CONSTANTS.T_planck;
        this.currentEpoch = EPOCHS[0];
        this.futureScenario = 'freeze';

        // Clusters
        this.clusters = [];
        this.clusterCount = 0;

        // Visual effects settings
        this.effects = {
            bloom: true,
            bloomIntensity: 0.7,
            motionBlur: true,
            filmGrain: true,
            grainIntensity: 0.05,
            vignette: true,
            vignetteIntensity: 0.3,
            cosmicWeb: false
        };

        // Tracers
        this.tracers = [];
        this.tracerMode = false;
        this.maxTracers = 10;

        // Bookmarks
        this.bookmarks = [];

        // Performance tracking
        this.fps = 60;
        this.frameTime = 16.67;
        this.physicsTime = 0;
        this.renderTime = 0;
        this.effectsTime = 0;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fpsHistory = new Array(60).fill(60);

        // Graphs data
        this.scaleHistory = new Array(100).fill(0);
        this.tempHistory = new Array(100).fill(0);

        // UI state
        this.uiCollapsed = false;
        this.showGrid = false;
        this.showVelocities = false;
        this.showHelp = false;
        this.showSettings = false;
        this.showParticleInfo = false;

        // Touch state
        this.touches = {};
        this.lastTouchDistance = 0;
        this.lastTouchCenter = { x: 0, y: 0 };
        this.isDragging = false;
        this.lastTapTime = 0;

        // Initialize
        this.init();
    }

    async init() {
        this.updateLoadingStatus("Initializing quantum foam...", 5);
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.updateLoadingStatus("Generating primordial fluctuations...", 20);
        await this.sleep(100);
        await this.initParticles();

        this.updateLoadingStatus("Calibrating cosmological parameters...", 50);
        await this.sleep(100);

        this.updateLoadingStatus("Binding event handlers...", 70);
        this.bindEvents();
        this.bindSettingsEvents();

        this.updateLoadingStatus("Initializing visualization systems...", 85);
        this.generateSessionId();
        this.initHistogram();
        this.initGraphs();
        this.initEpochMarkers();

        this.updateLoadingStatus("Starting simulation...", 100);
        await this.sleep(300);

        // Hide loading screen
        document.getElementById('loading').classList.add('hidden');
        this.startSimulation();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateLoadingStatus(status, progress) {
        document.getElementById('loading-status').textContent = status;
        document.getElementById('loading-progress').style.width = progress + '%';
    }

    generateSessionId() {
        const now = new Date();
        const id = `SIM_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
        document.getElementById('session-id').textContent = id;
    }

    resizeCanvas() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        [this.canvasMain, this.canvasEffects, this.canvasUI].forEach(canvas => {
            canvas.width = w;
            canvas.height = h;
        });
    }

    // ========================================================================
    // PARTICLE SYSTEM
    // ========================================================================
    async initParticles() {
        this.particles = {
            x: new Float32Array(this.particleCount),
            y: new Float32Array(this.particleCount),
            z: new Float32Array(this.particleCount),
            vx: new Float32Array(this.particleCount),
            vy: new Float32Array(this.particleCount),
            vz: new Float32Array(this.particleCount),
            mass: new Float32Array(this.particleCount),
            temperature: new Float32Array(this.particleCount),
            age: new Float32Array(this.particleCount),
            colorR: new Uint8Array(this.particleCount),
            colorG: new Uint8Array(this.particleCount),
            colorB: new Uint8Array(this.particleCount),
            brightness: new Float32Array(this.particleCount),
            size: new Float32Array(this.particleCount),
            clusterId: new Int32Array(this.particleCount),
            // Previous positions for motion blur
            prevX: new Float32Array(this.particleCount),
            prevY: new Float32Array(this.particleCount)
        };

        const perturbationAmplitude = 1e-5;

        for (let i = 0; i < this.particleCount; i++) {
            // Spherical distribution with density variation
            const radius = 50 * Math.pow(Math.random(), 1/3);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            this.particles.x[i] = radius * Math.sin(phi) * Math.cos(theta);
            this.particles.y[i] = radius * Math.sin(phi) * Math.sin(theta);
            this.particles.z[i] = radius * Math.cos(phi);

            // Primordial fluctuations
            this.particles.x[i] += (Math.random() - 0.5) * perturbationAmplitude * radius;
            this.particles.y[i] += (Math.random() - 0.5) * perturbationAmplitude * radius;
            this.particles.z[i] += (Math.random() - 0.5) * perturbationAmplitude * radius;

            // Initial Hubble flow + thermal velocity
            const hubbleVelocity = 0.001;
            this.particles.vx[i] = this.particles.x[i] * hubbleVelocity + (Math.random() - 0.5) * 0.1;
            this.particles.vy[i] = this.particles.y[i] * hubbleVelocity + (Math.random() - 0.5) * 0.1;
            this.particles.vz[i] = this.particles.z[i] * hubbleVelocity + (Math.random() - 0.5) * 0.1;

            // Mass with power-law distribution
            this.particles.mass[i] = 1e10 * Math.pow(Math.random() + 0.1, -2.3);

            // Initial Planck temperature
            this.particles.temperature[i] = CONSTANTS.T_planck * (0.9 + Math.random() * 0.2);

            // Age and visuals
            this.particles.age[i] = 0;
            this.particles.colorR[i] = 255;
            this.particles.colorG[i] = 255;
            this.particles.colorB[i] = 255;
            this.particles.brightness[i] = 0.5 + Math.random() * 0.5;
            this.particles.size[i] = 0.8 + Math.random() * 0.4;
            this.particles.clusterId[i] = -1;
            this.particles.prevX[i] = 0;
            this.particles.prevY[i] = 0;
        }

        await this.sleep(0);
    }

    // ========================================================================
    // PHYSICS ENGINE
    // ========================================================================
    hubbleParameter(z) {
        const Om = COSMOLOGY.Omega_m;
        const Or = COSMOLOGY.Omega_r;
        const Ok = COSMOLOGY.Omega_k;
        const Ol = COSMOLOGY.Omega_Lambda;
        const w = COSMOLOGY.w;

        const z1 = 1 + z;
        return CONSTANTS.H0 * Math.sqrt(
            Om * Math.pow(z1, 3) +
            Or * Math.pow(z1, 4) +
            Ok * Math.pow(z1, 2) +
            Ol * Math.pow(z1, 3 * (1 + w))
        );
    }

    getScaleFactor(time) {
        const t0 = COSMOLOGY.t_universe * CONSTANTS.Gyr_to_s;

        if (time < 1e-32) {
            return Math.exp(time * 1e35) * 1e-30;
        } else if (time < t0 * 0.7) {
            return Math.pow(time / t0, 2/3);
        } else {
            const H = CONSTANTS.H0_SI;
            return Math.exp(H * (time - t0 * 0.7)) * Math.pow(0.7, 2/3);
        }
    }

    getCMBTemperature(z) {
        return CONSTANTS.T_CMB_0 * (1 + z);
    }

    temperatureToColor(temp) {
        let r, g, b;

        if (temp > 30000) {
            r = 68; g = 136; b = 255;
        } else if (temp > 10000) {
            const t = (temp - 10000) / 20000;
            r = Math.floor(68 + 68 * t);
            g = Math.floor(136 + 51 * t);
            b = 255;
        } else if (temp > 6000) {
            const t = (temp - 6000) / 4000;
            r = Math.floor(136 + 119 * (1-t));
            g = Math.floor(187 + 68 * (1-t));
            b = 255;
        } else if (temp > 4000) {
            const t = (temp - 4000) / 2000;
            r = 255;
            g = Math.floor(200 + 55 * t);
            b = Math.floor(120 + 135 * t);
        } else if (temp > 3000) {
            const t = (temp - 3000) / 1000;
            r = 255;
            g = Math.floor(136 + 64 * t);
            b = Math.floor(68 + 52 * t);
        } else if (temp > 100) {
            const t = Math.min(1, (temp - 100) / 2900);
            r = Math.floor(180 + 75 * t);
            g = Math.floor(50 + 86 * t);
            b = Math.floor(50 + 18 * t);
        } else if (temp > 10) {
            const t = temp / 100;
            r = Math.floor(80 + 100 * t);
            g = Math.floor(20 + 30 * t);
            b = Math.floor(40 + 10 * t);
        } else {
            r = 30; g = 15; b = 40;
        }

        return { r: Math.min(255, Math.max(0, r)), g: Math.min(255, Math.max(0, g)), b: Math.min(255, Math.max(0, b)) };
    }

    updateCosmology(dt) {
        this.scaleFactor = this.getScaleFactor(this.time);
        const redshift = this.scaleFactor > 1e-20 ? (1 / this.scaleFactor) - 1 : 1e30;
        this.temperature = this.getCMBTemperature(Math.max(0, Math.min(redshift, 1e10)));
        this.temperature = Math.min(CONSTANTS.T_planck, Math.max(2.725, this.temperature));

        for (let i = EPOCHS.length - 1; i >= 0; i--) {
            if (this.time >= EPOCHS[i].timeStart) {
                if (this.currentEpoch !== EPOCHS[i]) {
                    this.currentEpoch = EPOCHS[i];
                    this.showEpochInfo(EPOCHS[i]);
                }
                break;
            }
        }

        // Update history for graphs
        this.scaleHistory.push(Math.log10(Math.max(1e-30, this.scaleFactor)));
        this.scaleHistory.shift();
        this.tempHistory.push(Math.log10(Math.max(1, this.temperature)));
        this.tempHistory.shift();

        return { redshift, scaleFactor: this.scaleFactor };
    }

    applyExpansion(dt) {
        const z = this.scaleFactor > 1e-20 ? (1/this.scaleFactor) - 1 : 1e10;
        const H = this.hubbleParameter(Math.min(z, 1e10));
        const expansionRate = H * 1e-6;

        for (let i = 0; i < this.particleCount; i++) {
            this.particles.x[i] *= (1 + expansionRate * dt);
            this.particles.y[i] *= (1 + expansionRate * dt);
            this.particles.z[i] *= (1 + expansionRate * dt);

            this.particles.vx[i] /= (1 + expansionRate * dt * 0.5);
            this.particles.vy[i] /= (1 + expansionRate * dt * 0.5);
            this.particles.vz[i] /= (1 + expansionRate * dt * 0.5);
        }
    }

    applyGravity(dt) {
        const G_scaled = 0.0001;
        const softening = 1.0;
        const gridSize = 10;
        const cellSize = 200 / gridSize;

        const grid = new Float32Array(gridSize * gridSize * gridSize);
        const gridCOM = new Float32Array(gridSize * gridSize * gridSize * 3);

        // Accumulate mass
        for (let i = 0; i < this.particleCount; i += 10) {
            const gx = Math.floor((this.particles.x[i] + 100) / cellSize);
            const gy = Math.floor((this.particles.y[i] + 100) / cellSize);
            const gz = Math.floor((this.particles.z[i] + 100) / cellSize);

            if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize && gz >= 0 && gz < gridSize) {
                const idx = gx + gy * gridSize + gz * gridSize * gridSize;
                grid[idx] += this.particles.mass[i];
                gridCOM[idx * 3] += this.particles.x[i] * this.particles.mass[i];
                gridCOM[idx * 3 + 1] += this.particles.y[i] * this.particles.mass[i];
                gridCOM[idx * 3 + 2] += this.particles.z[i] * this.particles.mass[i];
            }
        }

        // Normalize COMs
        for (let i = 0; i < gridSize * gridSize * gridSize; i++) {
            if (grid[i] > 0) {
                gridCOM[i * 3] /= grid[i];
                gridCOM[i * 3 + 1] /= grid[i];
                gridCOM[i * 3 + 2] /= grid[i];
            }
        }

        // Apply forces
        for (let i = 0; i < this.particleCount; i += 100) {
            let ax = 0, ay = 0, az = 0;

            for (let j = 0; j < gridSize * gridSize * gridSize; j++) {
                if (grid[j] > 0) {
                    const dx = gridCOM[j * 3] - this.particles.x[i];
                    const dy = gridCOM[j * 3 + 1] - this.particles.y[i];
                    const dz = gridCOM[j * 3 + 2] - this.particles.z[i];
                    const distSq = dx*dx + dy*dy + dz*dz + softening*softening;
                    const dist = Math.sqrt(distSq);
                    const force = G_scaled * grid[j] / distSq;

                    ax += force * dx / dist;
                    ay += force * dy / dist;
                    az += force * dz / dist;
                }
            }

            for (let k = i; k < Math.min(i + 100, this.particleCount); k++) {
                this.particles.vx[k] += ax * dt;
                this.particles.vy[k] += ay * dt;
                this.particles.vz[k] += az * dt;
            }
        }
    }

    integrateMotion(dt) {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.x[i] += this.particles.vx[i] * dt;
            this.particles.y[i] += this.particles.vy[i] * dt;
            this.particles.z[i] += this.particles.vz[i] * dt;
            this.particles.age[i] += dt;
        }
    }

    updateTemperatures(dt) {
        const coolingRate = 1 - 0.0005 * dt / this.timeSpeed;

        for (let i = 0; i < this.particleCount; i++) {
            this.particles.temperature[i] *= coolingRate;

            const dist = Math.sqrt(
                this.particles.x[i]**2 +
                this.particles.y[i]**2 +
                this.particles.z[i]**2
            );

            // Star formation heating in dense regions
            if (this.time > 6.3e15 && dist < 30) {
                this.particles.temperature[i] += Math.random() * 500 * dt / this.timeSpeed;
            }

            this.particles.temperature[i] = Math.max(2.725, Math.min(CONSTANTS.T_planck, this.particles.temperature[i]));

            const color = this.temperatureToColor(this.particles.temperature[i]);
            this.particles.colorR[i] = color.r;
            this.particles.colorG[i] = color.g;
            this.particles.colorB[i] = color.b;
        }
    }

    detectClusters() {
        // Simple density-based clustering
        this.clusterCount = 0;
        const gridSize = 8;
        const cellSize = 200 / gridSize;
        const densityGrid = new Float32Array(gridSize * gridSize * gridSize);

        for (let i = 0; i < this.particleCount; i += 50) {
            const gx = Math.floor((this.particles.x[i] + 100) / cellSize);
            const gy = Math.floor((this.particles.y[i] + 100) / cellSize);
            const gz = Math.floor((this.particles.z[i] + 100) / cellSize);

            if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize && gz >= 0 && gz < gridSize) {
                const idx = gx + gy * gridSize + gz * gridSize * gridSize;
                densityGrid[idx]++;
            }
        }

        const threshold = this.particleCount / 50 / (gridSize * gridSize * gridSize) * 3;
        for (let i = 0; i < densityGrid.length; i++) {
            if (densityGrid[i] > threshold) {
                this.clusterCount++;
            }
        }
    }

    updatePhysics(dt) {
        const physicsStart = performance.now();

        const scaledDt = dt * this.timeSpeed * (this.isReversed ? -1 : 1);
        this.time = Math.max(0, this.time + scaledDt);

        this.updateCosmology(scaledDt);

        if (this.time > 1e-32 && !this.isReversed) {
            this.applyExpansion(scaledDt / this.timeSpeed);

            if (this.time > 1.2e13) {
                this.applyGravity(scaledDt / this.timeSpeed);
            }
        }

        this.integrateMotion(scaledDt / this.timeSpeed * 0.01);
        this.updateTemperatures(scaledDt);

        // Detect clusters periodically
        if (this.frameCount % 60 === 0) {
            this.detectClusters();
        }

        this.physicsTime = performance.now() - physicsStart;
    }

    // ========================================================================
    // RENDERING
    // ========================================================================
    render() {
        const renderStart = performance.now();

        // Clear main canvas
        this.ctxMain.fillStyle = '#000000';
        this.ctxMain.fillRect(0, 0, this.canvasMain.width, this.canvasMain.height);

        const blur = this.currentEpoch.particleBlur;
        const jitter = this.currentEpoch.particleJitter;

        const centerX = this.canvasMain.width / 2 + this.camera.x;
        const centerY = this.canvasMain.height / 2 + this.camera.y;
        const zoom = this.camera.zoom;

        const cosRotX = Math.cos(this.camera.rotationX);
        const sinRotX = Math.sin(this.camera.rotationX);
        const cosRotY = Math.cos(this.camera.rotationY);
        const sinRotY = Math.sin(this.camera.rotationY);

        const visibleParticles = [];
        const stride = Math.max(1, Math.floor(this.particleCount / 150000));

        for (let i = 0; i < this.particleCount; i += stride) {
            let x = this.particles.x[i];
            let y = this.particles.y[i];
            let z = this.particles.z[i];

            const x1 = x * cosRotY - z * sinRotY;
            const z1 = x * sinRotY + z * cosRotY;
            const y1 = y * cosRotX - z1 * sinRotX;
            const z2 = y * sinRotX + z1 * cosRotX;

            const perspective = 500 / (500 + z2 + this.camera.z);
            const screenX = centerX + x1 * zoom * perspective;
            const screenY = centerY + y1 * zoom * perspective;

            if (screenX < -20 || screenX > this.canvasMain.width + 20 ||
                screenY < -20 || screenY > this.canvasMain.height + 20) {
                continue;
            }

            // Store previous position for motion blur
            const prevScreenX = this.particles.prevX[i];
            const prevScreenY = this.particles.prevY[i];
            this.particles.prevX[i] = screenX;
            this.particles.prevY[i] = screenY;

            visibleParticles.push({
                i: i,
                x: screenX,
                y: screenY,
                prevX: prevScreenX,
                prevY: prevScreenY,
                z: z2,
                size: Math.max(0.3, (1.5 + this.particles.size[i] * 0.5) * perspective * zoom * this.particleSizeMultiplier),
                r: this.particles.colorR[i],
                g: this.particles.colorG[i],
                b: this.particles.colorB[i],
                alpha: Math.min(1, 0.4 + this.particles.brightness[i] * 0.6),
                temp: this.particles.temperature[i]
            });
        }

        // Sort by depth
        visibleParticles.sort((a, b) => b.z - a.z);

        // Draw grid
        if (this.showGrid) {
            this.drawGrid(centerX, centerY, zoom);
        }

        // Draw cosmic web if enabled
        if (this.effects.cosmicWeb && this.time > 3.15e16) {
            this.drawCosmicWeb(visibleParticles);
        }

        // Render particles
        this.ctxMain.globalCompositeOperation = 'lighter';

        for (const p of visibleParticles) {
            const jx = p.x + (Math.random() - 0.5) * jitter * 5;
            const jy = p.y + (Math.random() - 0.5) * jitter * 5;

            // Motion blur trail
            if (this.effects.motionBlur && p.prevX !== 0) {
                const dx = jx - p.prevX;
                const dy = jy - p.prevY;
                const trailLength = Math.sqrt(dx*dx + dy*dy);

                if (trailLength > 1 && trailLength < 50) {
                    const gradient = this.ctxMain.createLinearGradient(p.prevX, p.prevY, jx, jy);
                    gradient.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, 0)`);
                    gradient.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha * 0.3})`);

                    this.ctxMain.strokeStyle = gradient;
                    this.ctxMain.lineWidth = p.size * 0.5;
                    this.ctxMain.beginPath();
                    this.ctxMain.moveTo(p.prevX, p.prevY);
                    this.ctxMain.lineTo(jx, jy);
                    this.ctxMain.stroke();
                }
            }

            // Glow effect
            if (this.effects.bloom && p.size > 0.5) {
                const glowSize = p.size * (3 + this.effects.bloomIntensity * 3);
                const gradient = this.ctxMain.createRadialGradient(jx, jy, 0, jx, jy, glowSize);
                gradient.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha * 0.4 * this.effects.bloomIntensity})`);
                gradient.addColorStop(0.5, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha * 0.15 * this.effects.bloomIntensity})`);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                this.ctxMain.fillStyle = gradient;
                this.ctxMain.beginPath();
                this.ctxMain.arc(jx, jy, glowSize, 0, Math.PI * 2);
                this.ctxMain.fill();
            }

            // Particle core
            this.ctxMain.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha})`;
            this.ctxMain.beginPath();
            this.ctxMain.arc(jx, jy, p.size, 0, Math.PI * 2);
            this.ctxMain.fill();
        }

        this.ctxMain.globalCompositeOperation = 'source-over';

        // Draw velocity vectors
        if (this.showVelocities) {
            this.drawVelocities(centerX, centerY, zoom, cosRotX, sinRotX, cosRotY, sinRotY);
        }

        // Draw tracers
        if (this.tracers.length > 0) {
            this.drawTracers(centerX, centerY, zoom, cosRotX, sinRotX, cosRotY, sinRotY);
        }

        this.renderTime = performance.now() - renderStart;
        return visibleParticles.length;
    }

    renderEffects() {
        const effectsStart = performance.now();

        this.ctxEffects.clearRect(0, 0, this.canvasEffects.width, this.canvasEffects.height);

        // Vignette
        if (this.effects.vignette) {
            const w = this.canvasEffects.width;
            const h = this.canvasEffects.height;
            const gradient = this.ctxEffects.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.7);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, `rgba(0, 0, 0, ${this.effects.vignetteIntensity})`);

            this.ctxEffects.fillStyle = gradient;
            this.ctxEffects.fillRect(0, 0, w, h);
        }

        // Film grain
        if (this.effects.filmGrain) {
            const imageData = this.ctxEffects.getImageData(0, 0, this.canvasEffects.width, this.canvasEffects.height);
            const data = imageData.data;
            const intensity = this.effects.grainIntensity * 50;

            for (let i = 0; i < data.length; i += 16) {  // Sample every 4th pixel for performance
                const noise = (Math.random() - 0.5) * intensity;
                data[i] = Math.min(255, Math.max(0, data[i] + noise));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
            }

            this.ctxEffects.putImageData(imageData, 0, 0);
        }

        this.effectsTime = performance.now() - effectsStart;
    }

    drawGrid(centerX, centerY, zoom) {
        this.ctxMain.strokeStyle = '#181818';
        this.ctxMain.lineWidth = 1;

        const gridSpacing = 20 * zoom;
        const gridCount = 20;

        for (let i = -gridCount; i <= gridCount; i++) {
            this.ctxMain.beginPath();
            this.ctxMain.moveTo(centerX - gridCount * gridSpacing, centerY + i * gridSpacing);
            this.ctxMain.lineTo(centerX + gridCount * gridSpacing, centerY + i * gridSpacing);
            this.ctxMain.stroke();

            this.ctxMain.beginPath();
            this.ctxMain.moveTo(centerX + i * gridSpacing, centerY - gridCount * gridSpacing);
            this.ctxMain.lineTo(centerX + i * gridSpacing, centerY + gridCount * gridSpacing);
            this.ctxMain.stroke();
        }
    }

    drawCosmicWeb(particles) {
        if (particles.length < 100) return;

        this.ctxMain.strokeStyle = 'rgba(60, 60, 80, 0.15)';
        this.ctxMain.lineWidth = 0.5;

        // Connect nearby particles
        for (let i = 0; i < Math.min(particles.length, 500); i += 5) {
            const p1 = particles[i];

            for (let j = i + 1; j < Math.min(i + 20, particles.length); j++) {
                const p2 = particles[j];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < 50 && dist > 5) {
                    const alpha = (1 - dist / 50) * 0.2;
                    this.ctxMain.strokeStyle = `rgba(80, 80, 100, ${alpha})`;
                    this.ctxMain.beginPath();
                    this.ctxMain.moveTo(p1.x, p1.y);
                    this.ctxMain.lineTo(p2.x, p2.y);
                    this.ctxMain.stroke();
                }
            }
        }
    }

    drawVelocities(centerX, centerY, zoom, cosRotX, sinRotX, cosRotY, sinRotY) {
        this.ctxMain.strokeStyle = 'rgba(100, 100, 120, 0.3)';
        this.ctxMain.lineWidth = 1;

        for (let i = 0; i < this.particleCount; i += 2000) {
            let x = this.particles.x[i];
            let y = this.particles.y[i];
            let z = this.particles.z[i];

            const x1 = x * cosRotY - z * sinRotY;
            const z1 = x * sinRotY + z * cosRotY;
            const y1 = y * cosRotX - z1 * sinRotX;
            const z2 = y * sinRotX + z1 * cosRotX;

            const perspective = 500 / (500 + z2 + this.camera.z);
            const screenX = centerX + x1 * zoom * perspective;
            const screenY = centerY + y1 * zoom * perspective;

            const vScale = 100;
            const vx = this.particles.vx[i] * vScale;
            const vy = this.particles.vy[i] * vScale;
            const vz = this.particles.vz[i] * vScale;

            const vx1 = vx * cosRotY - vz * sinRotY;
            const vz1 = vx * sinRotY + vz * cosRotY;
            const vy1 = vy * cosRotX - vz1 * sinRotX;

            const endX = screenX + vx1 * zoom * perspective;
            const endY = screenY + vy1 * zoom * perspective;

            this.ctxMain.beginPath();
            this.ctxMain.moveTo(screenX, screenY);
            this.ctxMain.lineTo(endX, endY);
            this.ctxMain.stroke();
        }
    }

    drawTracers(centerX, centerY, zoom, cosRotX, sinRotX, cosRotY, sinRotY) {
        for (const tracer of this.tracers) {
            const i = tracer.particleIndex;

            let x = this.particles.x[i];
            let y = this.particles.y[i];
            let z = this.particles.z[i];

            const x1 = x * cosRotY - z * sinRotY;
            const z1 = x * sinRotY + z * cosRotY;
            const y1 = y * cosRotX - z1 * sinRotX;
            const z2 = y * sinRotX + z1 * cosRotX;

            const perspective = 500 / (500 + z2 + this.camera.z);
            const screenX = centerX + x1 * zoom * perspective;
            const screenY = centerY + y1 * zoom * perspective;

            // Draw marker
            this.ctxMain.strokeStyle = '#ffffff';
            this.ctxMain.lineWidth = 1;
            this.ctxMain.beginPath();
            this.ctxMain.arc(screenX, screenY, 10, 0, Math.PI * 2);
            this.ctxMain.stroke();

            // Crosshairs
            this.ctxMain.beginPath();
            this.ctxMain.moveTo(screenX - 15, screenY);
            this.ctxMain.lineTo(screenX - 5, screenY);
            this.ctxMain.moveTo(screenX + 5, screenY);
            this.ctxMain.lineTo(screenX + 15, screenY);
            this.ctxMain.moveTo(screenX, screenY - 15);
            this.ctxMain.lineTo(screenX, screenY - 5);
            this.ctxMain.moveTo(screenX, screenY + 5);
            this.ctxMain.lineTo(screenX, screenY + 15);
            this.ctxMain.stroke();

            // Add to trail
            tracer.trail.push({ x: screenX, y: screenY });
            if (tracer.trail.length > 100) tracer.trail.shift();

            // Draw trail
            if (tracer.trail.length > 1) {
                this.ctxMain.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctxMain.beginPath();
                this.ctxMain.moveTo(tracer.trail[0].x, tracer.trail[0].y);
                for (let j = 1; j < tracer.trail.length; j++) {
                    this.ctxMain.lineTo(tracer.trail[j].x, tracer.trail[j].y);
                }
                this.ctxMain.stroke();
            }
        }
    }

    // ========================================================================
    // UI UPDATES
    // ========================================================================
    updateUI() {
        const timeStr = this.formatTime(this.time);
        const redshift = this.scaleFactor > 1e-20 ? (1 / this.scaleFactor) - 1 : Infinity;

        // Temporal
        document.getElementById('current-time').textContent = timeStr;
        document.getElementById('current-epoch').textContent = this.currentEpoch.name;
        document.getElementById('redshift').textContent = redshift > 1e10 ? '∞' : redshift.toFixed(4);
        document.getElementById('scale-factor').textContent = this.scaleFactor > 1e-10 ? this.scaleFactor.toFixed(6) : this.scaleFactor.toExponential(3);

        const presentTime = COSMOLOGY.t_universe * CONSTANTS.Gyr_to_s;
        const lookback = Math.max(0, presentTime - this.time);
        document.getElementById('lookback-time').textContent = this.formatTime(lookback);

        // Cosmological
        document.getElementById('universe-size').textContent = this.currentEpoch.size;
        document.getElementById('hubble-rate').textContent = this.hubbleParameter(Math.max(0, Math.min(redshift, 1e6))).toFixed(2) + ' km/s/Mpc';
        document.getElementById('cmb-temp').textContent = this.formatTemperature(this.temperature);
        document.getElementById('density').textContent = this.formatDensity();

        const expansionRate = this.time > 2.84e17 ? 'Accelerating' : (this.time > 1e-32 ? 'Decelerating' : 'Inflation');
        document.getElementById('expansion-rate').textContent = expansionRate;

        // Particles
        document.getElementById('total-particles').textContent = this.particleCount.toLocaleString();
        document.getElementById('visible-particles').textContent = this.particleCount.toLocaleString();
        document.getElementById('cluster-count').textContent = this.clusterCount.toString();
        document.getElementById('clustered-particles').textContent = Math.min(100, this.clusterCount * 5).toFixed(1) + '%';
        document.getElementById('avg-temp').textContent = this.formatTemperature(this.temperature);

        // Color composition
        const bluePct = this.time > 6.3e15 ? Math.min(30, (this.time - 6.3e15) / 1e16 * 30) : 0;
        const whitePct = this.time < 1e13 ? 100 - bluePct : Math.max(10, 60 - bluePct);
        const yellowPct = this.time > 1e15 ? Math.min(35, (this.time - 1e15) / 1e17 * 35) : 0;
        const redPct = 100 - bluePct - whitePct - yellowPct;

        document.getElementById('blue-pct').textContent = bluePct.toFixed(1) + '%';
        document.getElementById('white-pct').textContent = whitePct.toFixed(1) + '%';
        document.getElementById('yellow-pct').textContent = yellowPct.toFixed(1) + '%';
        document.getElementById('red-pct').textContent = Math.max(0, redPct).toFixed(1) + '%';

        // Performance
        document.getElementById('fps-counter').textContent = this.fps.toFixed(0) + ' FPS';
        document.getElementById('particle-count').textContent = (this.particleCount / 1000).toFixed(0) + 'k particles';
        document.getElementById('perf-fps').textContent = this.fps.toFixed(1);
        document.getElementById('frame-time').textContent = this.frameTime.toFixed(1) + ' ms';
        document.getElementById('physics-time').textContent = this.physicsTime.toFixed(1) + ' ms';
        document.getElementById('render-time').textContent = this.renderTime.toFixed(1) + ' ms';
        document.getElementById('effects-time').textContent = this.effectsTime.toFixed(1) + ' ms';

        // Camera
        document.getElementById('camera-pos').textContent = `(${this.camera.x.toFixed(0)}, ${this.camera.y.toFixed(0)}, ${this.camera.z.toFixed(0)})`;
        document.getElementById('camera-zoom').textContent = this.camera.zoom.toFixed(2) + 'x';
        document.getElementById('camera-rot').textContent = `(${(this.camera.rotationX * 180 / Math.PI).toFixed(0)}°, ${(this.camera.rotationY * 180 / Math.PI).toFixed(0)}°)`;

        // Timeline
        const futureTime = presentTime * 10;
        const progress = Math.min(100, (this.time / futureTime) * 100);
        document.getElementById('timeline-progress').style.width = progress + '%';
        document.getElementById('timeline-marker').style.left = progress + '%';
        document.getElementById('time-display').textContent = 't = ' + timeStr;
        document.getElementById('epoch-display').textContent = this.currentEpoch.shortName.toUpperCase();
        document.getElementById('speed-display').textContent = 'Speed: ×' + this.formatSpeed(this.timeSpeed);

        // Collapsed UI
        document.getElementById('collapsed-time').textContent = this.formatTimeShort(this.time);
        document.getElementById('collapsed-epoch').textContent = this.currentEpoch.shortName;
        document.getElementById('collapsed-fps').textContent = this.fps.toFixed(0);
        document.getElementById('collapsed-particles').textContent = (this.particleCount / 1000).toFixed(0) + 'k';
        document.getElementById('collapsed-speed').textContent = '×' + this.formatSpeed(this.timeSpeed);

        // Future scenario
        document.getElementById('future-mode').textContent = FUTURE_SCENARIOS[this.futureScenario].name;
        document.getElementById('future-w').textContent = 'w = ' + FUTURE_SCENARIOS[this.futureScenario].w.toFixed(1);
        document.getElementById('future-desc').textContent = FUTURE_SCENARIOS[this.futureScenario].description;

        // Effects status
        document.getElementById('fx-bloom').textContent = this.effects.bloom ? 'ON' : 'OFF';
        document.getElementById('fx-motion').textContent = this.effects.motionBlur ? 'ON' : 'OFF';
        document.getElementById('fx-grain').textContent = this.effects.filmGrain ? 'ON' : 'OFF';
        document.getElementById('fx-vignette').textContent = this.effects.vignette ? 'ON' : 'OFF';
        document.getElementById('fx-web').textContent = this.effects.cosmicWeb ? 'ON' : 'OFF';

        // Tracer panel
        if (this.tracerMode) {
            document.getElementById('tracer-panel').classList.add('visible');
            document.getElementById('tracer-count').textContent = `${this.tracers.length}/${this.maxTracers} particles`;
        } else {
            document.getElementById('tracer-panel').classList.remove('visible');
        }
    }

    updateGraphs() {
        // Scale factor graph
        const scaleCanvas = document.getElementById('graph-scale');
        if (scaleCanvas) {
            const ctx = scaleCanvas.getContext('2d');
            const w = scaleCanvas.width = scaleCanvas.parentElement.clientWidth;
            const h = scaleCanvas.height = 40;

            ctx.clearRect(0, 0, w, h);
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1;
            ctx.beginPath();

            const min = Math.min(...this.scaleHistory);
            const max = Math.max(...this.scaleHistory);
            const range = max - min || 1;

            for (let i = 0; i < this.scaleHistory.length; i++) {
                const x = (i / this.scaleHistory.length) * w;
                const y = h - ((this.scaleHistory[i] - min) / range) * (h - 4) - 2;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Temperature graph
        const tempCanvas = document.getElementById('graph-temp');
        if (tempCanvas) {
            const ctx = tempCanvas.getContext('2d');
            const w = tempCanvas.width = tempCanvas.parentElement.clientWidth;
            const h = tempCanvas.height = 40;

            ctx.clearRect(0, 0, w, h);
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.beginPath();

            const min = Math.min(...this.tempHistory);
            const max = Math.max(...this.tempHistory);
            const range = max - min || 1;

            for (let i = 0; i < this.tempHistory.length; i++) {
                const x = (i / this.tempHistory.length) * w;
                const y = h - ((this.tempHistory[i] - min) / range) * (h - 4) - 2;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // FPS graph
        const fpsCanvas = document.getElementById('graph-fps');
        if (fpsCanvas) {
            const ctx = fpsCanvas.getContext('2d');
            const w = fpsCanvas.width = fpsCanvas.parentElement.clientWidth;
            const h = fpsCanvas.height = 40;

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#333';

            for (let i = 0; i < this.fpsHistory.length; i++) {
                const x = (i / this.fpsHistory.length) * w;
                const barH = (this.fpsHistory[i] / 120) * h;
                ctx.fillRect(x, h - barH, w / this.fpsHistory.length - 1, barH);
            }
        }
    }

    initHistogram() {
        const container = document.getElementById('temp-histogram');
        container.innerHTML = '';
        for (let i = 0; i < 20; i++) {
            const bar = document.createElement('div');
            bar.className = 'histogram-bar';
            bar.style.height = (20 + Math.random() * 80) + '%';
            container.appendChild(bar);
        }
    }

    updateHistogram() {
        const bars = document.querySelectorAll('#temp-histogram .histogram-bar');
        bars.forEach((bar, i) => {
            const baseHeight = 20;
            const variation = Math.sin(this.frameCount * 0.02 + i * 0.5) * 30 + 50;
            bar.style.height = (baseHeight + variation) + '%';
        });
    }

    initGraphs() {
        // Initialize graph canvases
        const graphs = ['graph-scale', 'graph-temp', 'graph-fps'];
        graphs.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = 40;
            }
        });
    }

    initEpochMarkers() {
        const container = document.getElementById('epoch-markers');
        const presentTime = COSMOLOGY.t_universe * CONSTANTS.Gyr_to_s;
        const futureTime = presentTime * 10;

        EPOCHS.forEach((epoch, i) => {
            if (epoch.timeStart > 0) {
                const progress = (epoch.timeStart / futureTime) * 100;
                const marker = document.createElement('div');
                marker.className = 'epoch-marker';
                marker.style.left = progress + '%';
                container.appendChild(marker);
            }
        });
    }

    formatTime(seconds) {
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

    formatTimeShort(seconds) {
        if (seconds < 1) return seconds.toExponential(0);
        if (seconds < 3.156e10) return (seconds / 31536000).toFixed(0) + 'y';
        if (seconds < 3.156e13) return (seconds / 3.156e10).toFixed(0) + 'ky';
        if (seconds < 3.156e16) return (seconds / 3.156e13).toFixed(1) + 'My';
        return (seconds / 3.156e16).toFixed(1) + 'Gy';
    }

    formatTemperature(temp) {
        if (temp > 1e20) return temp.toExponential(2) + ' K';
        if (temp > 1e6) return (temp / 1e6).toFixed(1) + ' MK';
        if (temp > 1000) return (temp / 1000).toFixed(1) + ' kK';
        return temp.toFixed(1) + ' K';
    }

    formatDensity() {
        const rho_crit = 9.47e-27;
        const rho = rho_crit * Math.pow(Math.max(1e-30, this.scaleFactor), -3);
        return rho.toExponential(2) + ' kg/m³';
    }

    formatSpeed(speed) {
        if (speed >= 1e15) return '10¹⁵';
        if (speed >= 1e12) return '10¹²';
        if (speed >= 1e9) return '10⁹';
        if (speed >= 1e6) return '10⁶';
        if (speed >= 1e3) return '10³';
        return speed.toFixed(0);
    }

    // ========================================================================
    // EVENT HANDLING
    // ========================================================================
    bindEvents() {
        window.addEventListener('keydown', (e) => this.handleKeydown(e));

        this.canvasMain.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        this.canvasMain.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvasMain.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvasMain.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvasMain.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        this.canvasMain.addEventListener('contextmenu', (e) => e.preventDefault());

        this.canvasMain.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvasMain.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvasMain.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // UI Buttons
        document.getElementById('btn-play').addEventListener('click', () => this.togglePlay());
        document.getElementById('btn-rw').addEventListener('click', () => { this.timeSpeed = Math.max(1, this.timeSpeed / 10); });
        document.getElementById('btn-slow').addEventListener('click', () => { this.timeSpeed = Math.max(1, this.timeSpeed / 2); });
        document.getElementById('btn-fast').addEventListener('click', () => { this.timeSpeed = Math.min(1e18, this.timeSpeed * 2); });
        document.getElementById('btn-ff').addEventListener('click', () => { this.timeSpeed = Math.min(1e18, this.timeSpeed * 10); });
        document.getElementById('btn-reverse').addEventListener('click', () => { this.isReversed = !this.isReversed; });
        document.getElementById('btn-reset').addEventListener('click', () => this.resetSimulation());

        // Touch buttons
        document.getElementById('touch-settings').addEventListener('click', () => this.toggleSettings());
        document.getElementById('touch-zoomin').addEventListener('click', () => { this.camera.zoom *= 1.5; });
        document.getElementById('touch-zoomout').addEventListener('click', () => { this.camera.zoom /= 1.5; });
        document.getElementById('touch-play').addEventListener('click', () => this.togglePlay());
        document.getElementById('touch-reset').addEventListener('click', () => this.resetView());

        // Timeline
        document.getElementById('timeline-bar').addEventListener('click', (e) => this.handleTimelineClick(e));

        // Help
        document.getElementById('close-help').addEventListener('click', () => this.toggleHelp());

        // Settings
        document.getElementById('close-settings').addEventListener('click', () => this.toggleSettings());
    }

    bindSettingsEvents() {
        // Toggle switches
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                const id = toggle.id;

                switch(id) {
                    case 'toggle-motion': this.effects.motionBlur = toggle.classList.contains('active'); break;
                    case 'toggle-grain': this.effects.filmGrain = toggle.classList.contains('active'); break;
                    case 'toggle-vignette': this.effects.vignette = toggle.classList.contains('active'); break;
                    case 'toggle-web': this.effects.cosmicWeb = toggle.classList.contains('active'); break;
                    case 'toggle-grid': this.showGrid = toggle.classList.contains('active'); break;
                    case 'toggle-velocity': this.showVelocities = toggle.classList.contains('active'); break;
                }
            });
        });

        // Sliders
        document.getElementById('setting-bloom').addEventListener('input', (e) => {
            this.effects.bloomIntensity = e.target.value / 100;
            this.effects.bloom = this.effects.bloomIntensity > 0;
        });

        document.getElementById('setting-theta').addEventListener('input', (e) => {
            document.getElementById('theta-value').textContent = (e.target.value / 100).toFixed(2);
        });

        document.getElementById('setting-size').addEventListener('input', (e) => {
            this.particleSizeMultiplier = e.target.value / 100;
        });

        // Particle count
        document.getElementById('setting-particles').addEventListener('change', (e) => {
            const newCount = parseInt(e.target.value);
            if (newCount !== this.particleCount) {
                this.particleCount = newCount;
                this.showNotification('Restart required for particle count change');
            }
        });

        // Cosmology
        document.getElementById('setting-h0').addEventListener('change', (e) => {
            CONSTANTS.H0 = parseFloat(e.target.value);
        });

        document.getElementById('setting-w').addEventListener('change', (e) => {
            COSMOLOGY.w = parseFloat(e.target.value);
        });
    }

    handleKeydown(e) {
        // Don't handle if in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        switch(e.key.toLowerCase()) {
            case 'w': case 'arrowup':
                this.camera.y -= 30 / this.camera.zoom;
                break;
            case 's': case 'arrowdown':
                this.camera.y += 30 / this.camera.zoom;
                break;
            case 'a': case 'arrowleft':
                this.camera.x -= 30 / this.camera.zoom;
                break;
            case 'd': case 'arrowright':
                this.camera.x += 30 / this.camera.zoom;
                break;
            case 'q':
                this.camera.rotationY -= 0.1;
                break;
            case 'e':
                this.camera.rotationY += 0.1;
                break;
            case '=': case '+':
                this.camera.zoom = Math.min(100, this.camera.zoom * 1.2);
                break;
            case '-': case '_':
                this.camera.zoom = Math.max(0.1, this.camera.zoom / 1.2);
                break;

            case ' ':
                e.preventDefault();
                this.togglePlay();
                break;
            case '[':
                this.timeSpeed = Math.max(1, this.timeSpeed / 2);
                break;
            case ']':
                this.timeSpeed = Math.min(1e18, this.timeSpeed * 2);
                break;
            case 'backspace':
                e.preventDefault();
                this.isReversed = !this.isReversed;
                this.showNotification(this.isReversed ? 'Time reversed' : 'Time forward');
                break;

            case '1': this.jumpToEpoch(0); break;
            case '2': this.jumpToEpoch(1); break;
            case '3': this.jumpToEpoch(2); break;
            case '4': this.jumpToEpoch(3); break;
            case '5': this.jumpToEpoch(4); break;
            case '6': this.jumpToEpoch(5); break;
            case '7': this.jumpToEpoch(6); break;
            case '8': this.jumpToEpoch(7); break;
            case '9': this.jumpToEpoch(8); break;
            case '0': this.jumpToFuture(); break;

            case 'r':
                this.resetView();
                break;
            case 'h':
                this.toggleUI();
                break;
            case 'g':
                this.showGrid = !this.showGrid;
                document.getElementById('toggle-grid').classList.toggle('active', this.showGrid);
                break;
            case 'v':
                this.showVelocities = !this.showVelocities;
                document.getElementById('toggle-velocity').classList.toggle('active', this.showVelocities);
                break;
            case 'w':
                if (e.ctrlKey) break;
                this.effects.cosmicWeb = !this.effects.cosmicWeb;
                document.getElementById('toggle-web').classList.toggle('active', this.effects.cosmicWeb);
                break;
            case 'f':
                if (e.key === 'F1') {
                    e.preventDefault();
                    this.toggleHelp();
                } else if (e.key === 'F11') {
                    this.toggleFullscreen();
                } else {
                    this.cycleFutureScenario();
                }
                break;
            case 'p':
                this.toggleSettings();
                break;
            case 't':
                this.toggleTracerMode();
                break;
            case 'b':
                this.addBookmark();
                break;
            case 'i':
                this.showParticleInfo = !this.showParticleInfo;
                break;
            case 'escape':
                if (this.showHelp) this.toggleHelp();
                if (this.showSettings) this.toggleSettings();
                if (this.tracerMode) this.toggleTracerMode();
                break;
        }

        // Handle S for screenshot separately
        if (e.key.toLowerCase() === 's' && !e.ctrlKey) {
            this.takeScreenshot();
        }
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.camera.zoom = Math.max(0.1, Math.min(100, this.camera.zoom * delta));
    }

    handleMouseDown(e) {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        if (this.tracerMode && e.button === 0) {
            this.selectParticleForTracer(e.clientX, e.clientY);
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;

        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;

        if (e.buttons === 1 && !e.shiftKey) {
            this.camera.x += dx;
            this.camera.y += dy;
        } else if (e.buttons === 1 && e.shiftKey || e.buttons === 2) {
            this.camera.rotationY += dx * 0.005;
            this.camera.rotationX += dy * 0.005;
        }

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }

    handleMouseUp(e) {
        this.isDragging = false;
    }

    handleTouchStart(e) {
        e.preventDefault();

        for (let touch of e.changedTouches) {
            this.touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
        }

        if (Object.keys(this.touches).length === 2) {
            const touchPoints = Object.values(this.touches);
            this.lastTouchDistance = Math.hypot(touchPoints[1].x - touchPoints[0].x, touchPoints[1].y - touchPoints[0].y);
            this.lastTouchCenter = {
                x: (touchPoints[0].x + touchPoints[1].x) / 2,
                y: (touchPoints[0].y + touchPoints[1].y) / 2
            };
        }

        this.isDragging = true;

        // Store for single touch pan
        if (Object.keys(this.touches).length === 1) {
            const touch = Object.values(this.touches)[0];
            this.lastTouchX = touch.x;
            this.lastTouchY = touch.y;
        }
    }

    handleTouchMove(e) {
        e.preventDefault();

        for (let touch of e.changedTouches) {
            if (this.touches[touch.identifier]) {
                this.touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
            }
        }

        const touchCount = Object.keys(this.touches).length;

        if (touchCount === 1) {
            const touch = Object.values(this.touches)[0];
            const dx = touch.x - this.lastTouchX;
            const dy = touch.y - this.lastTouchY;
            this.camera.x += dx;
            this.camera.y += dy;
            this.lastTouchX = touch.x;
            this.lastTouchY = touch.y;
        } else if (touchCount === 2) {
            const touchPoints = Object.values(this.touches);
            const currentDistance = Math.hypot(touchPoints[1].x - touchPoints[0].x, touchPoints[1].y - touchPoints[0].y);
            const currentCenter = {
                x: (touchPoints[0].x + touchPoints[1].x) / 2,
                y: (touchPoints[0].y + touchPoints[1].y) / 2
            };

            if (this.lastTouchDistance > 0) {
                const scale = currentDistance / this.lastTouchDistance;
                this.camera.zoom = Math.max(0.1, Math.min(100, this.camera.zoom * scale));
            }

            const dx = currentCenter.x - this.lastTouchCenter.x;
            const dy = currentCenter.y - this.lastTouchCenter.y;
            this.camera.rotationY += dx * 0.005;
            this.camera.rotationX += dy * 0.005;

            this.lastTouchDistance = currentDistance;
            this.lastTouchCenter = currentCenter;
        }
    }

    handleTouchEnd(e) {
        for (let touch of e.changedTouches) {
            delete this.touches[touch.identifier];
        }

        if (Object.keys(this.touches).length === 0) {
            this.isDragging = false;

            const now = Date.now();
            if (now - this.lastTapTime < 300) {
                this.resetView();
            }
            this.lastTapTime = now;
        }
    }

    handleTimelineClick(e) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const progress = x / rect.width;

        const futureTime = COSMOLOGY.t_universe * CONSTANTS.Gyr_to_s * 10;
        this.time = progress * futureTime;
        this.updateCosmology(0);
    }

    // ========================================================================
    // CONTROLS & FEATURES
    // ========================================================================
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('btn-play');
        btn.textContent = this.isPlaying ? '⏸' : '▶';
        btn.classList.toggle('active', this.isPlaying);
        document.getElementById('touch-play').textContent = this.isPlaying ? '⏸' : '▶';
    }

    resetView() {
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.z = 100;
        this.camera.zoom = 1;
        this.camera.rotationX = 0;
        this.camera.rotationY = 0;
        this.showNotification('View reset');
    }

    resetSimulation() {
        this.time = 0;
        this.scaleFactor = 1e-30;
        this.temperature = CONSTANTS.T_planck;
        this.currentEpoch = EPOCHS[0];
        this.isPlaying = true;
        this.isReversed = false;
        this.timeSpeed = 1e10;
        this.tracers = [];
        this.initParticles();
        this.resetView();
        this.showNotification('Simulation reset');
    }

    jumpToEpoch(epochIndex) {
        if (epochIndex >= 0 && epochIndex < EPOCHS.length) {
            const epoch = EPOCHS[epochIndex];
            this.time = epoch.timeStart;
            this.showEpochInfo(epoch);
        }
    }

    jumpToFuture() {
        this.time = COSMOLOGY.t_universe * CONSTANTS.Gyr_to_s * 2;
        this.showNotification('Jumped to far future');
    }

    showEpochInfo(epoch) {
        const infoEl = document.getElementById('epoch-info');
        document.getElementById('epoch-title').textContent = epoch.name;
        document.getElementById('epoch-time-range').textContent = epoch.timeRange;
        document.getElementById('epoch-description').textContent = epoch.description;
        infoEl.classList.add('visible');

        setTimeout(() => infoEl.classList.remove('visible'), 4000);
    }

    cycleFutureScenario() {
        const scenarios = Object.keys(FUTURE_SCENARIOS);
        const currentIndex = scenarios.indexOf(this.futureScenario);
        this.futureScenario = scenarios[(currentIndex + 1) % scenarios.length];
        COSMOLOGY.w = FUTURE_SCENARIOS[this.futureScenario].w;
        this.showNotification('Future: ' + FUTURE_SCENARIOS[this.futureScenario].name);
    }

    toggleUI() {
        this.uiCollapsed = !this.uiCollapsed;
        document.body.classList.toggle('ui-collapsed', this.uiCollapsed);
    }

    toggleHelp() {
        this.showHelp = !this.showHelp;
        document.getElementById('help-modal').classList.toggle('visible', this.showHelp);
    }

    toggleSettings() {
        this.showSettings = !this.showSettings;
        document.getElementById('settings-panel').classList.toggle('visible', this.showSettings);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    toggleTracerMode() {
        this.tracerMode = !this.tracerMode;
        if (!this.tracerMode) {
            this.tracers = [];
        }
        this.showNotification(this.tracerMode ? 'Tracer mode ON - click particles' : 'Tracer mode OFF');
    }

    selectParticleForTracer(screenX, screenY) {
        if (this.tracers.length >= this.maxTracers) {
            this.showNotification('Max tracers reached');
            return;
        }

        // Find closest particle to click
        const centerX = this.canvasMain.width / 2 + this.camera.x;
        const centerY = this.canvasMain.height / 2 + this.camera.y;
        const zoom = this.camera.zoom;

        const cosRotX = Math.cos(this.camera.rotationX);
        const sinRotX = Math.sin(this.camera.rotationX);
        const cosRotY = Math.cos(this.camera.rotationY);
        const sinRotY = Math.sin(this.camera.rotationY);

        let closestDist = Infinity;
        let closestIdx = -1;

        for (let i = 0; i < this.particleCount; i += 100) {
            const x1 = this.particles.x[i] * cosRotY - this.particles.z[i] * sinRotY;
            const z1 = this.particles.x[i] * sinRotY + this.particles.z[i] * cosRotY;
            const y1 = this.particles.y[i] * cosRotX - z1 * sinRotX;
            const z2 = this.particles.y[i] * sinRotX + z1 * cosRotX;

            const perspective = 500 / (500 + z2 + this.camera.z);
            const px = centerX + x1 * zoom * perspective;
            const py = centerY + y1 * zoom * perspective;

            const dist = Math.hypot(px - screenX, py - screenY);
            if (dist < closestDist) {
                closestDist = dist;
                closestIdx = i;
            }
        }

        if (closestDist < 50) {
            this.tracers.push({
                particleIndex: closestIdx,
                trail: []
            });
            this.showNotification(`Tracer added (#${this.tracers.length})`);
        }
    }

    addBookmark() {
        const bookmark = {
            time: this.time,
            epoch: this.currentEpoch.shortName,
            label: this.formatTimeShort(this.time)
        };

        this.bookmarks.push(bookmark);

        const list = document.getElementById('bookmarks-list');
        if (this.bookmarks.length === 1) {
            list.innerHTML = '';
        }

        const item = document.createElement('div');
        item.className = 'bookmark-item';
        item.innerHTML = `
            <span>${bookmark.epoch} - ${bookmark.label}</span>
            <span class="bookmark-jump" onclick="simulator.jumpToBookmark(${this.bookmarks.length - 1})">JUMP</span>
        `;
        list.appendChild(item);

        this.showNotification('Bookmark added');
    }

    jumpToBookmark(index) {
        if (index >= 0 && index < this.bookmarks.length) {
            this.time = this.bookmarks[index].time;
            this.updateCosmology(0);
            this.showNotification('Jumped to bookmark');
        }
    }

    takeScreenshot() {
        // Flash effect
        const flash = document.getElementById('screenshot-flash');
        flash.classList.add('flash');
        setTimeout(() => flash.classList.remove('flash'), 100);

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

        this.showNotification('Screenshot saved');
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('visible');

        setTimeout(() => notification.classList.remove('visible'), 2000);
    }

    // ========================================================================
    // MAIN LOOP
    // ========================================================================
    startSimulation() {
        this.lastFrameTime = performance.now();
        this.animate();
    }

    animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        // FPS tracking
        this.frameCount++;
        this.fps = 1 / deltaTime;
        this.frameTime = deltaTime * 1000;
        this.fpsHistory.push(this.fps);
        this.fpsHistory.shift();

        // Physics
        if (this.isPlaying) {
            this.updatePhysics(deltaTime);
        }

        // Render
        const visibleCount = this.render();

        // Effects
        if (this.frameCount % 2 === 0) {
            this.renderEffects();
        }

        // UI updates (throttled)
        if (this.frameCount % 5 === 0) {
            this.updateUI();
        }

        if (this.frameCount % 30 === 0) {
            this.updateHistogram();
            this.updateGraphs();
        }

        requestAnimationFrame(() => this.animate());
    }
}

// ============================================================================
// INITIALIZE
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    window.simulator = new UniverseSimulator();
});
