// Universe Evolution Simulator v2.47.3
// Complete physics-based simulation from Big Bang to future scenarios

// ==================== CONSTANTS & CONFIGURATION ====================

const CONFIG = {
    // Particle system
    particleCount: 50000, // Scalable: 10k-100k for web, up to 4M with WebGPU

    // Physics constants
    G: 6.674e-11,              // Gravitational constant (m³/kg·s²)
    c: 2.998e8,                // Speed of light (m/s)
    kB: 1.381e-23,             // Boltzmann constant (J/K)
    H0: 67.4,                  // Hubble constant (km/s/Mpc)

    // Cosmological parameters
    Omega_m: 0.3111,           // Matter density
    Omega_Lambda: 0.6889,      // Dark energy density
    Omega_b: 0.0486,           // Baryonic matter
    Omega_r: 9.24e-5,          // Radiation density
    T0_CMB: 2.725,             // Current CMB temperature (K)

    // Simulation parameters
    softening: 1e19,           // Softening length (1 kpc in meters)
    timeStep: 1e12,            // Initial time step (seconds)
    maxTimeSpeed: 1e15,        // Maximum time acceleration

    // Rendering
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight,
    fov: 60,
    particleSize: 2.0
};

// ==================== COSMIC EPOCHS DEFINITION ====================

const EPOCHS = {
    planck: {
        name: 'Planck Epoch',
        timeStart: 0,
        timeEnd: 1e-43,
        temp: 1.417e32,
        size: 1e-35,
        description: 'Quantum foam, max blur',
        color: [255, 255, 255]
    },
    inflation: {
        name: 'Cosmic Inflation',
        timeStart: 1e-36,
        timeEnd: 1e-32,
        temp: 1e27,
        size: 0.1,
        description: '10²⁶× expansion',
        color: [255, 255, 240]
    },
    qgp: {
        name: 'Quark-Gluon Plasma',
        timeStart: 1e-32,
        timeEnd: 1,
        temp: 1e12,
        size: 20 * 9.461e15, // 20 light-years
        description: 'Quark soup cooling',
        color: [255, 200, 150]
    },
    nucleosynthesis: {
        name: 'Nucleosynthesis',
        timeStart: 180,
        timeEnd: 1200,
        temp: 1e9,
        size: 300 * 9.461e15,
        description: 'First nuclei form',
        color: [255, 220, 100]
    },
    recombination: {
        name: 'Recombination',
        timeStart: 3.8e5 * 31536000,
        timeEnd: 3.9e5 * 31536000,
        temp: 3000,
        size: 84e6 * 9.461e15,
        description: 'CMB released, atoms form',
        color: [255, 180, 80]
    },
    darkages: {
        name: 'Dark Ages',
        timeStart: 3.8e5 * 31536000,
        timeEnd: 2e8 * 31536000,
        temp: 100,
        size: 9e9 * 9.461e15,
        description: 'No stars, only gravity',
        color: [100, 40, 40]
    },
    firststars: {
        name: 'First Stars',
        timeStart: 2e8 * 31536000,
        timeEnd: 1e9 * 31536000,
        temp: 10000,
        size: 9e9 * 9.461e15,
        description: 'Reionization begins',
        color: [150, 180, 255]
    },
    structure: {
        name: 'Structure Formation',
        timeStart: 1e9 * 31536000,
        timeEnd: 9e9 * 31536000,
        temp: 5000,
        size: 60e9 * 9.461e15,
        description: 'Galaxies and clusters',
        color: [200, 200, 255]
    },
    modern: {
        name: 'Dark Energy Era',
        timeStart: 9e9 * 31536000,
        timeEnd: 13.8e9 * 31536000,
        temp: 2.725,
        size: 93e9 * 9.461e15,
        description: 'Accelerating expansion',
        color: [180, 180, 255]
    },
    present: {
        name: 'Present Day',
        timeStart: 13.797e9 * 31536000,
        timeEnd: 13.799e9 * 31536000,
        temp: 2.725,
        size: 93e9 * 9.461e15,
        description: 'Now',
        color: [180, 180, 255]
    },
    // Future scenarios
    bigfreeze: {
        name: 'Big Freeze',
        timeStart: 13.8e9 * 31536000,
        timeEnd: 100e9 * 31536000,
        temp: 0.1,
        size: 1000e9 * 9.461e15,
        description: 'Heat death, eternal expansion',
        color: [20, 20, 40]
    },
    bigrip: {
        name: 'Big Rip',
        timeStart: 13.8e9 * 31536000,
        timeEnd: 22e9 * 31536000,
        temp: 10000,
        size: 200e9 * 9.461e15,
        description: 'Phantom energy tears apart',
        color: [200, 200, 255]
    },
    bigcrunch: {
        name: 'Big Crunch',
        timeStart: 13.8e9 * 31536000,
        timeEnd: 48e9 * 31536000,
        temp: 1e6,
        size: 10e9 * 9.461e15,
        description: 'Recollapse to singularity',
        color: [255, 100, 100]
    },
    bigbounce: {
        name: 'Big Bounce',
        timeStart: 13.8e9 * 31536000,
        timeEnd: 50e9 * 31536000,
        temp: 1e32,
        size: 1e-20,
        description: 'Cyclic universe restarts',
        color: [255, 255, 255]
    }
};

// ==================== PARTICLE SYSTEM (Structure of Arrays) ====================

class ParticleSystem {
    constructor(count) {
        this.count = count;

        // Position (meters)
        this.x = new Float32Array(count);
        this.y = new Float32Array(count);
        this.z = new Float32Array(count);

        // Velocity (m/s)
        this.vx = new Float32Array(count);
        this.vy = new Float32Array(count);
        this.vz = new Float32Array(count);

        // Force (N)
        this.fx = new Float32Array(count);
        this.fy = new Float32Array(count);
        this.fz = new Float32Array(count);

        // Properties
        this.mass = new Float32Array(count);
        this.temperature = new Float32Array(count);
        this.age = new Float32Array(count);
        this.brightness = new Float32Array(count);

        // Color (0-255)
        this.colorR = new Uint8Array(count);
        this.colorG = new Uint8Array(count);
        this.colorB = new Uint8Array(count);

        this.initialize();
    }

    initialize() {
        const spread = 1e20; // Initial spread (100 kpc)
        const massAvg = 1e30; // ~0.5 solar mass per particle
        const perturbationAmplitude = 1e-5; // Density perturbation (δρ/ρ ≈ 10⁻⁵)

        for (let i = 0; i < this.count; i++) {
            // Base Gaussian distribution for positions
            let baseX = this.gaussianRandom() * spread;
            let baseY = this.gaussianRandom() * spread;
            let baseZ = this.gaussianRandom() * spread;

            // Add density perturbations (simulating primordial fluctuations)
            const perturbScale = spread * 0.1; // Scale of perturbations
            const perturb = this.densityPerturbation(baseX, baseY, baseZ, perturbScale);

            this.x[i] = baseX + perturb.x * perturbationAmplitude * spread;
            this.y[i] = baseY + perturb.y * perturbationAmplitude * spread;
            this.z[i] = baseZ + perturb.z * perturbationAmplitude * spread;

            // Small initial velocities (thermal) with perturbations
            const vThermal = 1000; // m/s
            this.vx[i] = this.gaussianRandom() * vThermal + perturb.vx * 100;
            this.vy[i] = this.gaussianRandom() * vThermal + perturb.vy * 100;
            this.vz[i] = this.gaussianRandom() * vThermal + perturb.vz * 100;

            // Mass with variation (some clustering)
            const massVariation = 0.5 + Math.random() * 1.5 + Math.abs(perturb.x) * 0.1;
            this.mass[i] = massAvg * massVariation;

            // Initial temperature (will be set by cosmology)
            this.temperature[i] = 1e32;
            this.age[i] = 0;
            this.brightness[i] = 1.0;

            // Initial color (white hot)
            this.colorR[i] = 255;
            this.colorG[i] = 255;
            this.colorB[i] = 255;
        }
    }

    densityPerturbation(x, y, z, scale) {
        // Simplified noise-like perturbation (mimics power spectrum)
        // In a full simulation, this would use Perlin noise or a proper power spectrum
        const k = 2 * Math.PI / scale;
        const phase1 = Math.sin(k * x) * Math.cos(k * y);
        const phase2 = Math.cos(k * y) * Math.sin(k * z);
        const phase3 = Math.sin(k * z) * Math.cos(k * x);

        return {
            x: phase1 + Math.random() * 0.5 - 0.25,
            y: phase2 + Math.random() * 0.5 - 0.25,
            z: phase3 + Math.random() * 0.5 - 0.25,
            vx: phase2 * 0.1,
            vy: phase3 * 0.1,
            vz: phase1 * 0.1
        };
    }

    gaussianRandom() {
        // Box-Muller transform for Gaussian distribution
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    updateColors(temperature) {
        for (let i = 0; i < this.count; i++) {
            const T = this.temperature[i];
            const color = this.temperatureToRGB(T);
            this.colorR[i] = color.r;
            this.colorG[i] = color.g;
            this.colorB[i] = color.b;
        }
    }

    temperatureToRGB(T) {
        // Convert temperature to RGB using Wien's law approximation
        if (T > 30000) {
            return { r: 68, g: 136, b: 255 }; // Blue
        } else if (T > 10000) {
            return { r: 136, g: 187, b: 255 }; // Blue-white
        } else if (T > 6000) {
            return { r: 255, g: 255, b: 255 }; // White
        } else if (T > 4000) {
            return { r: 255, g: 221, b: 136 }; // Yellow
        } else if (T > 3000) {
            return { r: 255, g: 136, b: 68 }; // Orange
        } else if (T > 100) {
            return { r: 255, g: 68, b: 68 }; // Red
        } else {
            return { r: 136, g: 34, b: 34 }; // Deep red
        }
    }
}

// ==================== COSMOLOGY ENGINE ====================

class CosmologyEngine {
    constructor() {
        this.time = 0; // Current cosmic time (seconds)
        this.scaleFactor = 1e-30; // Scale factor a(t)
        this.hubbleParam = 0; // H(t) in SI units
        this.temperature = 1.417e32; // Temperature (K)
        this.redshift = Infinity;
        this.currentEpoch = 'planck';
        this.universeSize = 1e-35; // meters
        this.futureScenario = 'standard'; // standard, bigfreeze, bigrip, bigcrunch, bigbounce
        this.w = -1.0; // Dark energy equation of state parameter
    }

    update(dt) {
        this.time += dt;

        // Update scale factor using Friedmann equation
        const H = this.calculateHubble(this.scaleFactor);
        const dadt = H * this.scaleFactor;
        this.scaleFactor += dadt * dt;

        // Prevent negative scale factor
        if (this.scaleFactor < 1e-50) this.scaleFactor = 1e-50;

        // Update temperature: T(z) = T0(1+z)
        this.redshift = (1.0 / this.scaleFactor) - 1.0;
        if (this.redshift < 0) this.redshift = 0;
        this.temperature = CONFIG.T0_CMB * (1 + this.redshift);

        // Update Hubble parameter
        this.hubbleParam = H;

        // Update universe size (comoving horizon)
        this.universeSize = this.scaleFactor * 4.4e26; // ~93 Gly when a=1

        // Determine current epoch
        this.updateEpoch();
    }

    calculateHubble(a) {
        // H(a) = H0 * sqrt(Omega_m/a³ + Omega_r/a⁴ + Omega_Lambda)
        const H0_SI = CONFIG.H0 * 1000 / (3.086e22); // Convert to SI (1/s)

        const term_m = CONFIG.Omega_m / (a * a * a);
        const term_r = CONFIG.Omega_r / (a * a * a * a);
        const term_L = CONFIG.Omega_Lambda;

        return H0_SI * Math.sqrt(term_m + term_r + term_L);
    }

    updateEpoch() {
        const t = this.time;

        if (t < EPOCHS.planck.timeEnd) {
            this.currentEpoch = 'planck';
        } else if (t < EPOCHS.inflation.timeEnd) {
            this.currentEpoch = 'inflation';
        } else if (t < EPOCHS.qgp.timeEnd) {
            this.currentEpoch = 'qgp';
        } else if (t < EPOCHS.nucleosynthesis.timeEnd) {
            this.currentEpoch = 'nucleosynthesis';
        } else if (t < EPOCHS.recombination.timeEnd) {
            this.currentEpoch = 'recombination';
        } else if (t < EPOCHS.darkages.timeEnd) {
            this.currentEpoch = 'darkages';
        } else if (t < EPOCHS.firststars.timeEnd) {
            this.currentEpoch = 'firststars';
        } else if (t < EPOCHS.structure.timeEnd) {
            this.currentEpoch = 'structure';
        } else if (t < EPOCHS.modern.timeEnd) {
            this.currentEpoch = 'modern';
        } else if (t < EPOCHS.present.timeEnd) {
            this.currentEpoch = 'present';
        } else {
            // Future scenarios
            if (this.futureScenario === 'bigfreeze') {
                this.currentEpoch = 'bigfreeze';
            } else if (this.futureScenario === 'bigrip') {
                this.currentEpoch = 'bigrip';
            } else if (this.futureScenario === 'bigcrunch') {
                this.currentEpoch = 'bigcrunch';
            } else if (this.futureScenario === 'bigbounce') {
                this.currentEpoch = 'bigbounce';
            } else {
                this.currentEpoch = 'present';
            }
        }
    }

    setFutureScenario(scenario) {
        this.futureScenario = scenario;

        // Adjust physics parameters based on scenario
        switch(scenario) {
            case 'bigfreeze':
                this.w = -1.0; // Standard cosmological constant
                CONFIG.Omega_Lambda = 0.7; // Slightly higher dark energy
                break;
            case 'bigrip':
                this.w = -1.5; // Phantom energy
                CONFIG.Omega_Lambda = 0.8;
                break;
            case 'bigcrunch':
                this.w = -0.5; // Weaker dark energy
                CONFIG.Omega_m = 1.2; // Closed universe
                CONFIG.Omega_Lambda = 0.0;
                break;
            case 'bigbounce':
                this.w = -1.0;
                CONFIG.Omega_Lambda = 0.0;
                CONFIG.Omega_m = 1.0;
                break;
            default:
                this.w = -1.0;
                CONFIG.Omega_Lambda = 0.6889;
                CONFIG.Omega_m = 0.3111;
        }
    }

    getEpochInfo() {
        return EPOCHS[this.currentEpoch];
    }

    jumpToEpoch(epochName) {
        const epoch = EPOCHS[epochName];
        if (epoch) {
            this.time = epoch.timeStart;
            // Scale factor from time (simplified)
            const age_universe = 13.8e9 * 31536000; // seconds
            const fraction = this.time / age_universe;
            this.scaleFactor = Math.pow(fraction, 2/3) * 1e-10; // Matter-dominated approximation
            if (this.scaleFactor < 1e-50) this.scaleFactor = 1e-50;
            this.updateEpoch();
        }
    }
}

// ==================== PHYSICS ENGINE ====================

class PhysicsEngine {
    constructor(particles, cosmology) {
        this.particles = particles;
        this.cosmology = cosmology;
        this.totalEnergy = 0;
        this.kineticEnergy = 0;
        this.potentialEnergy = 0;
    }

    update(dt) {
        // Apply cosmological expansion
        this.applyExpansion(dt);

        // Calculate gravitational forces (simplified O(N²) for smaller counts)
        // For production, use Barnes-Hut octree
        this.calculateForces();

        // Integrate equations of motion (Velocity Verlet)
        this.integrate(dt);

        // Update particle properties
        this.updateParticleProperties();

        // Calculate energies
        this.calculateEnergies();
    }

    applyExpansion(dt) {
        const H = this.cosmology.hubbleParam;
        const expansion = H * dt;

        // Hubble flow: dr/dt = H * r
        for (let i = 0; i < this.particles.count; i++) {
            this.particles.x[i] *= (1 + expansion);
            this.particles.y[i] *= (1 + expansion);
            this.particles.z[i] *= (1 + expansion);

            // Redshift velocities (adiabatic cooling)
            this.particles.vx[i] /= (1 + expansion);
            this.particles.vy[i] /= (1 + expansion);
            this.particles.vz[i] /= (1 + expansion);
        }
    }

    calculateForces() {
        // Reset forces
        this.particles.fx.fill(0);
        this.particles.fy.fill(0);
        this.particles.fz.fill(0);

        const G = CONFIG.G;
        const eps2 = CONFIG.softening * CONFIG.softening;
        const n = this.particles.count;

        // Simplified direct N-body (O(N²))
        // Sample only nearby particles for performance
        const sampleRate = Math.max(1, Math.floor(n / 5000)); // Limit to ~5000 interactions per particle

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j += sampleRate) {
                const dx = this.particles.x[j] - this.particles.x[i];
                const dy = this.particles.y[j] - this.particles.y[i];
                const dz = this.particles.z[j] - this.particles.z[i];

                const r2 = dx*dx + dy*dy + dz*dz + eps2;
                const r = Math.sqrt(r2);
                const r3 = r * r2;

                // F = G * m1 * m2 / r²
                const f = G * this.particles.mass[i] * this.particles.mass[j] / r3;

                const fx = f * dx;
                const fy = f * dy;
                const fz = f * dz;

                this.particles.fx[i] += fx;
                this.particles.fy[i] += fy;
                this.particles.fz[i] += fz;

                this.particles.fx[j] -= fx;
                this.particles.fy[j] -= fy;
                this.particles.fz[j] -= fz;
            }
        }
    }

    integrate(dt) {
        // Velocity Verlet integration
        const n = this.particles.count;

        // Update velocities (half step)
        for (let i = 0; i < n; i++) {
            const ax = this.particles.fx[i] / this.particles.mass[i];
            const ay = this.particles.fy[i] / this.particles.mass[i];
            const az = this.particles.fz[i] / this.particles.mass[i];

            this.particles.vx[i] += 0.5 * ax * dt;
            this.particles.vy[i] += 0.5 * ay * dt;
            this.particles.vz[i] += 0.5 * az * dt;
        }

        // Update positions
        for (let i = 0; i < n; i++) {
            this.particles.x[i] += this.particles.vx[i] * dt;
            this.particles.y[i] += this.particles.vy[i] * dt;
            this.particles.z[i] += this.particles.vz[i] * dt;
        }

        // Recalculate forces (in full implementation)
        // For now, assume forces don't change much in one step

        // Update velocities (final half step)
        for (let i = 0; i < n; i++) {
            const ax = this.particles.fx[i] / this.particles.mass[i];
            const ay = this.particles.fy[i] / this.particles.mass[i];
            const az = this.particles.fz[i] / this.particles.mass[i];

            this.particles.vx[i] += 0.5 * ax * dt;
            this.particles.vy[i] += 0.5 * ay * dt;
            this.particles.vz[i] += 0.5 * az * dt;
        }
    }

    updateParticleProperties() {
        const T_cmb = this.cosmology.temperature;

        for (let i = 0; i < this.particles.count; i++) {
            // Update temperature based on CMB and kinetic energy
            const v2 = this.particles.vx[i]**2 + this.particles.vy[i]**2 + this.particles.vz[i]**2;
            const T_kinetic = (this.particles.mass[i] * v2) / (3 * CONFIG.kB);

            // Temperature is mix of CMB and local kinetic
            this.particles.temperature[i] = T_cmb + T_kinetic * 0.01;

            // Update age
            this.particles.age[i] = this.cosmology.time;

            // Brightness based on temperature
            this.particles.brightness[i] = Math.min(1.0, this.particles.temperature[i] / 10000);
        }

        // Update colors
        this.particles.updateColors();
    }

    calculateEnergies() {
        this.kineticEnergy = 0;
        this.potentialEnergy = 0;

        const n = this.particles.count;

        // Kinetic energy
        for (let i = 0; i < n; i++) {
            const v2 = this.particles.vx[i]**2 + this.particles.vy[i]**2 + this.particles.vz[i]**2;
            this.kineticEnergy += 0.5 * this.particles.mass[i] * v2;
        }

        // Potential energy (sample for performance)
        const sampleSize = Math.min(1000, n);
        for (let i = 0; i < sampleSize; i++) {
            for (let j = i + 1; j < sampleSize; j++) {
                const dx = this.particles.x[j] - this.particles.x[i];
                const dy = this.particles.y[j] - this.particles.y[i];
                const dz = this.particles.z[j] - this.particles.z[i];
                const r = Math.sqrt(dx*dx + dy*dy + dz*dz + CONFIG.softening**2);

                this.potentialEnergy -= CONFIG.G * this.particles.mass[i] * this.particles.mass[j] / r;
            }
        }

        // Scale up potential energy estimate
        const scaleFactor = (n * n) / (sampleSize * sampleSize);
        this.potentialEnergy *= scaleFactor;

        this.totalEnergy = this.kineticEnergy + this.potentialEnergy;
    }
}

// ==================== RENDERER ====================

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.width = canvas.width = CONFIG.canvasWidth;
        this.height = canvas.height = CONFIG.canvasHeight;

        // Camera
        this.camera = {
            x: 0,
            y: 0,
            z: -5e21, // Start 5 Mpc back
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            zoom: 1.0
        };

        // View matrix
        this.viewScale = 1e-19; // Scale for viewing
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    render(particles, cosmology) {
        // Fade effect for motion blur (instead of full clear)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Get epoch info for special effects
        const epoch = cosmology.getEpochInfo();

        // Calculate view parameters
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const scale = this.viewScale * this.camera.zoom * Math.min(this.width, this.height);

        // Sort particles by depth (simple painter's algorithm)
        const depths = new Array(particles.count);
        for (let i = 0; i < particles.count; i++) {
            const dx = particles.x[i] - this.camera.x;
            const dy = particles.y[i] - this.camera.y;
            const dz = particles.z[i] - this.camera.z;
            depths[i] = { index: i, depth: dz };
        }
        depths.sort((a, b) => a.depth - b.depth);

        // Render particles
        for (let i = 0; i < particles.count; i++) {
            const idx = depths[i].index;

            // Transform to camera space
            let x = particles.x[idx] - this.camera.x;
            let y = particles.y[idx] - this.camera.y;
            let z = particles.z[idx] - this.camera.z;

            // Apply rotation
            const cosY = Math.cos(this.camera.rotY);
            const sinY = Math.sin(this.camera.rotY);
            const cosX = Math.cos(this.camera.rotX);
            const sinX = Math.sin(this.camera.rotX);

            // Rotate around Y axis
            let x1 = x * cosY - z * sinY;
            let z1 = x * sinY + z * cosY;

            // Rotate around X axis
            let y1 = y * cosX - z1 * sinX;
            let z2 = y * sinX + z1 * cosX;

            // Project to screen
            const screenX = centerX + x1 * scale;
            const screenY = centerY + y1 * scale;

            // Skip if off-screen
            if (screenX < -100 || screenX > this.width + 100 ||
                screenY < -100 || screenY > this.height + 100) {
                continue;
            }

            // Size based on brightness and zoom
            const size = CONFIG.particleSize * particles.brightness[idx] * this.camera.zoom;

            // Color
            const r = particles.colorR[idx];
            const g = particles.colorG[idx];
            const b = particles.colorB[idx];
            const alpha = particles.brightness[idx] * 0.8;

            // Draw particle with glow
            this.ctx.beginPath();

            // Outer glow
            const gradient = this.ctx.createRadialGradient(
                screenX, screenY, 0,
                screenX, screenY, size * 4
            );
            gradient.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
            gradient.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

            this.ctx.fillStyle = gradient;
            this.ctx.arc(screenX, screenY, size * 4, 0, Math.PI * 2);
            this.ctx.fill();

            // Core
            this.ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Add vignette effect
        this.applyVignette();
    }

    applyVignette() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, maxRadius * 0.5,
            centerX, centerY, maxRadius
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}

// ==================== INPUT CONTROLLER ====================

class InputController {
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;

        // Mouse state
        this.mouseDown = false;
        this.rightMouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Touch state
        this.touches = [];
        this.lastTouchDist = 0;
        this.lastTouchAngle = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.mouseDown = true;
            } else if (e.button === 2) {
                this.rightMouseDown = true;
            }
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            e.preventDefault();
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouseDown = false;
            } else if (e.button === 2) {
                this.rightMouseDown = false;
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.mouseDown) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;

                // Rotate camera
                this.camera.rotY += dx * 0.01;
                this.camera.rotX += dy * 0.01;

                // Clamp X rotation
                this.camera.rotX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotX));
            } else if (this.rightMouseDown) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;

                // Pan camera
                const panSpeed = 1e19 / this.camera.zoom;
                this.camera.x -= dx * panSpeed;
                this.camera.y += dy * panSpeed;
            }

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        this.canvas.addEventListener('wheel', (e) => {
            // Zoom
            const zoomSpeed = 0.001;
            this.camera.zoom *= (1 - e.deltaY * zoomSpeed);
            this.camera.zoom = Math.max(0.1, Math.min(100, this.camera.zoom));
            e.preventDefault();
        });

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            this.touches = Array.from(e.touches);
            if (this.touches.length === 2) {
                this.lastTouchDist = this.getTouchDistance();
                this.lastTouchAngle = this.getTouchAngle();
            }
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            const newTouches = Array.from(e.touches);

            if (newTouches.length === 1 && this.touches.length === 1) {
                // Single touch - pan
                const dx = newTouches[0].clientX - this.touches[0].clientX;
                const dy = newTouches[0].clientY - this.touches[0].clientY;

                // Pan camera
                const panSpeed = 1e19 / this.camera.zoom;
                this.camera.x -= dx * panSpeed;
                this.camera.y += dy * panSpeed;

            } else if (newTouches.length === 2 && this.touches.length === 2) {
                // Two fingers - pinch zoom and rotate
                const newDist = this.getTouchDistance(newTouches);
                const newAngle = this.getTouchAngle(newTouches);

                // Pinch zoom
                const distRatio = newDist / this.lastTouchDist;
                this.camera.zoom *= distRatio;
                this.camera.zoom = Math.max(0.1, Math.min(100, this.camera.zoom));

                // Rotate
                const angleDiff = newAngle - this.lastTouchAngle;
                this.camera.rotZ += angleDiff;

                this.lastTouchDist = newDist;
                this.lastTouchAngle = newAngle;
            }

            this.touches = newTouches;
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            this.touches = Array.from(e.touches);
            if (this.touches.length === 2) {
                this.lastTouchDist = this.getTouchDistance();
                this.lastTouchAngle = this.getTouchAngle();
            }
            e.preventDefault();
        }, { passive: false });
    }

    getTouchDistance(touches = this.touches) {
        if (touches.length < 2) return 0;
        const dx = touches[1].clientX - touches[0].clientX;
        const dy = touches[1].clientY - touches[0].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getTouchAngle(touches = this.touches) {
        if (touches.length < 2) return 0;
        const dx = touches[1].clientX - touches[0].clientX;
        const dy = touches[1].clientY - touches[0].clientY;
        return Math.atan2(dy, dx);
    }

    resetCamera() {
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.z = -5e21;
        this.camera.rotX = 0;
        this.camera.rotY = 0;
        this.camera.rotZ = 0;
        this.camera.zoom = 1.0;
    }
}

// ==================== MAIN SIMULATOR ====================

class UniverseSimulator {
    constructor() {
        this.canvas = document.getElementById('universe-canvas');
        this.particles = new ParticleSystem(CONFIG.particleCount);
        this.cosmology = new CosmologyEngine();
        this.physics = new PhysicsEngine(this.particles, this.cosmology);
        this.renderer = new Renderer(this.canvas);
        this.input = new InputController(this.canvas, this.renderer.camera);

        // Simulation state
        this.running = false;
        this.timeSpeed = 1e6; // Time acceleration factor
        this.realDt = 1/60; // Real time per frame (seconds)

        // Performance tracking
        this.fps = 60;
        this.frameTime = 16.7;
        this.physicsTime = 0;
        this.renderTime = 0;
        this.lastFrameTime = performance.now();
        this.frameTimes = [];

        this.setupUI();
        this.setupKeyboard();
    }

    setupUI() {
        // Play/Pause
        document.getElementById('btn-play-pause').addEventListener('click', () => {
            this.running = !this.running;
            document.getElementById('btn-play-pause').textContent = this.running ? '❚❚ PAUSE' : '► PLAY';
        });

        // Reset
        document.getElementById('btn-reset').addEventListener('click', () => {
            this.cosmology.time = 0;
            this.cosmology.scaleFactor = 1e-30;
            this.cosmology.updateEpoch();
            this.particles.initialize();
            this.input.resetCamera();
        });

        // Speed controls
        document.getElementById('btn-slower').addEventListener('click', () => {
            this.timeSpeed /= 10;
            if (this.timeSpeed < 1) this.timeSpeed = 1;
        });

        document.getElementById('btn-faster').addEventListener('click', () => {
            this.timeSpeed *= 10;
            if (this.timeSpeed > CONFIG.maxTimeSpeed) this.timeSpeed = CONFIG.maxTimeSpeed;
        });

        // Epoch buttons
        document.querySelectorAll('.epoch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const epoch = btn.dataset.epoch;

                // Check if it's a future scenario
                const futureScenarios = ['bigfreeze', 'bigrip', 'bigcrunch', 'bigbounce'];
                if (futureScenarios.includes(epoch)) {
                    this.cosmology.setFutureScenario(epoch);
                }

                this.cosmology.jumpToEpoch(epoch);
                this.showEpochInfo(EPOCHS[epoch].name);
            });
        });

        // Timeline scrubber
        const timelineBar = document.getElementById('timeline-bar');
        const timelineHandle = document.getElementById('timeline-handle');
        let draggingTimeline = false;

        timelineHandle.addEventListener('mousedown', (e) => {
            draggingTimeline = true;
            e.stopPropagation();
        });

        document.addEventListener('mouseup', () => {
            draggingTimeline = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (draggingTimeline) {
                const rect = timelineBar.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const fraction = Math.max(0, Math.min(1, x / rect.width));

                // Map to cosmic time (0 to 13.8 Gyr)
                const maxTime = 13.8e9 * 31536000; // seconds
                this.cosmology.time = fraction * maxTime;
                this.cosmology.scaleFactor = Math.pow(fraction, 2/3) * 1e-10;
                if (this.cosmology.scaleFactor < 1e-50) this.cosmology.scaleFactor = 1e-50;
                this.cosmology.updateEpoch();
            }
        });

        timelineBar.addEventListener('click', (e) => {
            const rect = timelineBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const fraction = Math.max(0, Math.min(1, x / rect.width));

            const maxTime = 13.8e9 * 31536000;
            this.cosmology.time = fraction * maxTime;
            this.cosmology.scaleFactor = Math.pow(fraction, 2/3) * 1e-10;
            if (this.cosmology.scaleFactor < 1e-50) this.cosmology.scaleFactor = 1e-50;
            this.cosmology.updateEpoch();
        });
    }

    setupKeyboard() {
        // Track pressed keys for smooth camera movement
        this.keysPressed = new Set();

        document.addEventListener('keydown', (e) => {
            this.keysPressed.add(e.key.toLowerCase());

            // Quick epoch jumps (Shift + number)
            if (e.shiftKey) {
                const epochMap = {
                    '1': 'planck',
                    '2': 'inflation',
                    '3': 'qgp',
                    '4': 'nucleosynthesis',
                    '5': 'recombination',
                    '6': 'darkages',
                    '7': 'firststars',
                    '8': 'structure',
                    '9': 'present',
                    '0': 'bigfreeze'
                };
                if (epochMap[e.key]) {
                    const epoch = epochMap[e.key];
                    if (epoch === 'bigfreeze' || epoch === 'bigrip' || epoch === 'bigcrunch' || epoch === 'bigbounce') {
                        this.cosmology.setFutureScenario(epoch);
                    }
                    this.cosmology.jumpToEpoch(epoch);
                    this.showEpochInfo(EPOCHS[epoch].name);
                    return;
                }
            }

            // Speed multiplier shortcuts (1-9 without shift)
            if (!e.shiftKey && !e.ctrlKey && e.key >= '1' && e.key <= '9') {
                const multiplier = parseInt(e.key);
                this.timeSpeed = Math.pow(10, multiplier);
                if (this.timeSpeed > CONFIG.maxTimeSpeed) this.timeSpeed = CONFIG.maxTimeSpeed;
                return;
            }
            if (!e.shiftKey && !e.ctrlKey && e.key === '0') {
                this.timeSpeed = 1;
                return;
            }

            switch(e.key) {
                case ' ':
                    this.running = !this.running;
                    document.getElementById('btn-play-pause').textContent = this.running ? '❚❚ PAUSE' : '► PLAY';
                    e.preventDefault();
                    break;

                // Time control
                case '[':
                    this.timeSpeed /= 2;
                    if (this.timeSpeed < 1) this.timeSpeed = 1;
                    break;
                case ']':
                    this.timeSpeed *= 2;
                    if (this.timeSpeed > CONFIG.maxTimeSpeed) this.timeSpeed = CONFIG.maxTimeSpeed;
                    break;
                case 'Backspace':
                    // Reverse time
                    this.timeSpeed *= -1;
                    break;
                case 'Enter':
                    // Step forward one frame
                    const wasRunning = this.running;
                    this.running = true;
                    this.update();
                    this.running = wasRunning;
                    break;

                // View controls
                case 'r':
                case 'R':
                    this.input.resetCamera();
                    break;
                case 't':
                case 'T':
                    // Top view
                    this.renderer.camera.rotX = -Math.PI / 2;
                    this.renderer.camera.rotY = 0;
                    break;
                case 'f':
                case 'F':
                    // Front view
                    this.renderer.camera.rotX = 0;
                    this.renderer.camera.rotY = 0;
                    break;
                case 'l':
                case 'L':
                    // Left view
                    this.renderer.camera.rotX = 0;
                    this.renderer.camera.rotY = Math.PI / 2;
                    break;
                case 'Home':
                    this.renderer.camera.x = 0;
                    this.renderer.camera.y = 0;
                    this.renderer.camera.z = -5e21;
                    break;

                // UI toggles
                case 'h':
                case 'H':
                    document.getElementById('ui-container').classList.toggle('hidden');
                    break;

                // Zoom
                case '+':
                case '=':
                    this.renderer.camera.zoom *= 1.2;
                    break;
                case '-':
                case '_':
                    this.renderer.camera.zoom /= 1.2;
                    this.renderer.camera.zoom = Math.max(0.1, this.renderer.camera.zoom);
                    break;

                // Fullscreen
                case 'F11':
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen();
                    } else {
                        document.exitFullscreen();
                    }
                    e.preventDefault();
                    break;

                // Reset simulation
                case 'F5':
                    this.cosmology.time = 0;
                    this.cosmology.scaleFactor = 1e-30;
                    this.cosmology.updateEpoch();
                    this.particles.initialize();
                    this.input.resetCamera();
                    e.preventDefault();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keysPressed.delete(e.key.toLowerCase());
        });
    }

    // Process continuous keyboard input (called every frame)
    processKeyboardMovement() {
        const panSpeed = 5e18 / this.renderer.camera.zoom; // Adjust for zoom
        const rotSpeed = 0.02;
        const zoomSpeed = 0.02;

        // Camera panning (WASD and arrows)
        if (this.keysPressed.has('w') || this.keysPressed.has('arrowup')) {
            this.renderer.camera.y -= panSpeed;
        }
        if (this.keysPressed.has('s') || this.keysPressed.has('arrowdown')) {
            this.renderer.camera.y += panSpeed;
        }
        if (this.keysPressed.has('a') || this.keysPressed.has('arrowleft')) {
            this.renderer.camera.x += panSpeed;
        }
        if (this.keysPressed.has('d') || this.keysPressed.has('arrowright')) {
            this.renderer.camera.x -= panSpeed;
        }

        // Move up/down
        if (this.keysPressed.has(' ') && this.keysPressed.has('shift')) {
            this.renderer.camera.z -= panSpeed;
        }
        if (this.keysPressed.has('shift')) {
            this.renderer.camera.z += panSpeed * 0.5;
        }

        // Rotation
        if (this.keysPressed.has('q')) {
            this.renderer.camera.rotZ -= rotSpeed;
        }
        if (this.keysPressed.has('e')) {
            this.renderer.camera.rotZ += rotSpeed;
        }
    }

    showEpochInfo(epochName) {
        const info = document.getElementById('epoch-info');
        info.textContent = epochName;
        info.classList.add('visible');
        setTimeout(() => {
            info.classList.remove('visible');
        }, 2000);
    }

    update() {
        if (!this.running) return;

        const startPhysics = performance.now();

        // Calculate simulation timestep
        const dt = this.realDt * this.timeSpeed;

        // Update cosmology
        this.cosmology.update(dt);

        // Update physics
        this.physics.update(dt);

        this.physicsTime = performance.now() - startPhysics;
    }

    render() {
        const startRender = performance.now();

        this.renderer.render(this.particles, this.cosmology);

        this.renderTime = performance.now() - startRender;
    }

    updateUI() {
        // Time display
        const time = this.cosmology.time;
        let timeStr;
        if (time < 1e-30) {
            timeStr = '0.000 s';
        } else if (time < 1) {
            timeStr = time.toExponential(3) + ' s';
        } else if (time < 60) {
            timeStr = time.toFixed(3) + ' s';
        } else if (time < 3600) {
            timeStr = (time / 60).toFixed(2) + ' min';
        } else if (time < 31536000) {
            timeStr = (time / 3600).toFixed(2) + ' hr';
        } else if (time < 31536000000) {
            timeStr = (time / 31536000).toFixed(3) + ' yr';
        } else {
            timeStr = (time / (31536000 * 1e9)).toFixed(3) + ' Gyr';
        }
        document.getElementById('current-time').textContent = timeStr;

        // Epoch
        const epoch = this.cosmology.getEpochInfo();
        document.getElementById('current-epoch').textContent = epoch.name;

        // Redshift
        const z = this.cosmology.redshift;
        document.getElementById('redshift').textContent = z > 1000 ? 'z = ∞' : 'z = ' + z.toFixed(4);

        // Scale factor
        document.getElementById('scale-factor').textContent = 'a = ' + this.cosmology.scaleFactor.toExponential(2);

        // Timeline progress
        const maxTime = 13.8e9 * 31536000;
        const progress = Math.min(1, this.cosmology.time / maxTime) * 100;
        document.getElementById('timeline-progress').style.width = progress + '%';
        document.getElementById('timeline-handle').style.left = progress + '%';

        // Universe size
        const size = this.cosmology.universeSize;
        let sizeStr;
        if (size < 1e-20) {
            sizeStr = size.toExponential(2) + ' m';
        } else if (size < 9.461e15) {
            sizeStr = (size / 9.461e15).toExponential(2) + ' ly';
        } else {
            sizeStr = (size / (9.461e15 * 1e9)).toFixed(3) + ' Gly';
        }
        document.getElementById('universe-size').textContent = sizeStr;

        // Hubble parameter
        const H_SI = this.cosmology.hubbleParam;
        const H_conventional = H_SI * 3.086e22 / 1000; // Convert to km/s/Mpc
        document.getElementById('hubble-param').textContent = H_conventional.toFixed(2) + ' km/s/Mpc';

        // CMB Temperature
        const T = this.cosmology.temperature;
        document.getElementById('cmb-temp').textContent = T > 1e6 ? T.toExponential(3) + ' K' : T.toFixed(3) + ' K';

        // Future scenario
        const scenarioNames = {
            'standard': 'Standard ΛCDM',
            'bigfreeze': 'Big Freeze (Heat Death)',
            'bigrip': 'Big Rip (Phantom Energy)',
            'bigcrunch': 'Big Crunch (Recollapse)',
            'bigbounce': 'Big Bounce (Cyclic)'
        };
        document.getElementById('future-scenario').textContent = scenarioNames[this.cosmology.futureScenario] || 'Standard ΛCDM';

        // Particle counts
        document.getElementById('particle-count').textContent = this.particles.count.toLocaleString();
        document.getElementById('visible-count').textContent = this.particles.count.toLocaleString();

        // Average temperature
        let avgTemp = 0;
        for (let i = 0; i < this.particles.count; i++) {
            avgTemp += this.particles.temperature[i];
        }
        avgTemp /= this.particles.count;
        document.getElementById('avg-temp').textContent = avgTemp > 1e6 ? avgTemp.toExponential(2) + ' K' : avgTemp.toFixed(0) + ' K';

        // Energy
        document.getElementById('total-energy').textContent = this.physics.totalEnergy.toExponential(2) + ' J';

        // Time speed
        document.getElementById('time-speed').textContent = '×' + this.timeSpeed.toExponential(1);

        // Performance
        document.getElementById('fps').textContent = this.fps.toFixed(1);
        document.getElementById('frame-time').textContent = this.frameTime.toFixed(1) + ' ms';
        document.getElementById('physics-time').textContent = this.physicsTime.toFixed(1) + ' ms';
        document.getElementById('render-time').textContent = this.renderTime.toFixed(1) + ' ms';

        // Quality
        const quality = this.fps > 50 ? 'High' : this.fps > 30 ? 'Medium' : 'Low';
        document.getElementById('quality-level').textContent = quality;
    }

    mainLoop() {
        const now = performance.now();
        const dt = now - this.lastFrameTime;
        this.lastFrameTime = now;

        // Calculate FPS
        this.frameTimes.push(dt);
        if (this.frameTimes.length > 30) this.frameTimes.shift();
        const avgDt = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        this.fps = 1000 / avgDt;
        this.frameTime = avgDt;

        // Process keyboard movement
        if (this.keysPressed) {
            this.processKeyboardMovement();
        }

        // Update simulation
        this.update();

        // Render
        this.render();

        // Update UI
        this.updateUI();

        // Continue loop
        requestAnimationFrame(() => this.mainLoop());
    }

    async init() {
        // Show loading screen
        const loadingProgress = document.getElementById('loading-progress');
        const loadingStatus = document.getElementById('loading-status');

        loadingStatus.textContent = 'Initializing particles...';
        loadingProgress.style.width = '25%';
        await this.sleep(100);

        loadingStatus.textContent = 'Building physics engine...';
        loadingProgress.style.width = '50%';
        await this.sleep(100);

        loadingStatus.textContent = 'Configuring cosmology...';
        loadingProgress.style.width = '75%';
        await this.sleep(100);

        loadingStatus.textContent = 'Ready!';
        loadingProgress.style.width = '100%';
        await this.sleep(200);

        // Hide loading screen
        document.getElementById('loading-screen').classList.add('hidden');

        // Resize handler
        window.addEventListener('resize', () => {
            this.renderer.resize();
        });

        // Start main loop
        this.mainLoop();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ==================== START SIMULATION ====================

const simulator = new UniverseSimulator();
simulator.init();
