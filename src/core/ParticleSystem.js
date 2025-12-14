/**
 * Particle System
 * Universe Evolution Simulator v2.47.3
 *
 * Structure of Arrays (SoA) layout for optimal cache performance
 * Manages all particle data and initialization
 */

import { PLANCK } from '../utils/constants.js';
import { SIMULATION } from '../utils/constants.js';
import { Random, Vec3 } from '../utils/math.js';

export class ParticleSystem {
    constructor(count = SIMULATION.particleCount) {
        this.count = count;
        this.activeCount = count;
        this.visibleCount = count;

        // Structure of Arrays layout for cache efficiency
        this.particles = null;

        // Cluster tracking
        this.clusterCount = 0;
        this.clusteredParticleCount = 0;

        // Statistics
        this.stats = {
            avgTemperature: PLANCK.temperature,
            minTemperature: PLANCK.temperature,
            maxTemperature: PLANCK.temperature,
            totalMass: 0,
            totalKineticEnergy: 0,
            totalPotentialEnergy: 0,
            colorDistribution: {
                blue: 0,
                white: 100,
                yellow: 0,
                orange: 0,
                red: 0
            }
        };
    }

    /**
     * Initialize particle arrays
     */
    async initialize() {
        const n = this.count;

        this.particles = {
            // Position (comoving coordinates)
            x: new Float32Array(n),
            y: new Float32Array(n),
            z: new Float32Array(n),

            // Velocity
            vx: new Float32Array(n),
            vy: new Float32Array(n),
            vz: new Float32Array(n),

            // Physical properties
            mass: new Float32Array(n),
            temperature: new Float32Array(n),
            age: new Float32Array(n),
            density: new Float32Array(n),

            // Visual properties
            colorR: new Uint8Array(n),
            colorG: new Uint8Array(n),
            colorB: new Uint8Array(n),
            brightness: new Float32Array(n),
            size: new Float32Array(n),

            // Clustering
            clusterId: new Int32Array(n),

            // Previous screen positions for motion blur
            prevScreenX: new Float32Array(n),
            prevScreenY: new Float32Array(n),

            // Flags
            active: new Uint8Array(n),
            visible: new Uint8Array(n),

            // ========== NEW: Galaxy Properties ==========
            galaxyName: new Array(n).fill(''),
            galaxyType: new Uint8Array(n),          // 0=spiral, 1=elliptical, 2=irregular, 3=dwarf
            galaxyMass: new Float32Array(n),        // Stellar mass (M☉)
            galaxyRadius: new Float32Array(n),      // Effective radius (kpc)
            galaxySFR: new Float32Array(n),         // Star formation rate (M☉/yr)
            galaxyMetallicity: new Float32Array(n), // Metallicity (Z/Z☉)
            galaxyAge: new Float32Array(n),         // Age since formation (Gyr)
            mergedWith: new Int32Array(n).fill(-1), // -1 if active, else index merged into

            // ========== NEW: Visual Evolution Properties ==========
            blur: new Float32Array(n).fill(1.0),    // Current blur amount (0-1)
            jitter: new Float32Array(n).fill(1.0),  // Random motion amount (0-1)
            baseSize: new Float32Array(n).fill(1.0) // Base size before scaling
        };

        await this.generateInitialConditions();
    }

    /**
     * Generate initial particle distribution
     */
    async generateInitialConditions(config = {}) {
        const {
            distribution = 'singularity',  // START FROM BIG BANG SINGULARITY
            radius = 0.1,  // Very small initial radius (singularity)
            perturbationAmplitude = SIMULATION.perturbationAmplitude * 100,  // 100x STRONGER perturbations to break symmetry!
            hubbleVelocity = 0.001,
            thermalVelocity = 0.5  // Increased thermal velocity for more randomness
        } = config;

        const n = this.count;
        const p = this.particles;

        for (let i = 0; i < n; i++) {
            // Start from SINGULARITY - tiny dense point
            let pos;
            if (distribution === 'singularity') {
                // All particles start very close together (Planck epoch)
                // Add randomness to radius to break perfect symmetry
                const r = radius * Math.cbrt(Math.random()) * (0.5 + Math.random() * 1.5);
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                pos = new Vec3(
                    r * Math.sin(phi) * Math.cos(theta),
                    r * Math.sin(phi) * Math.sin(theta),
                    r * Math.cos(phi)
                );
            } else {
                pos = this.generateSphericalPosition(radius);
            }

            // STRONG primordial quantum fluctuations - break all symmetry!
            // Use MULTIPLE layers of randomization to destroy any grid patterns

            // Layer 1: Uniform random
            const perturbX1 = (Math.random() - 0.5) * perturbationAmplitude;
            const perturbY1 = (Math.random() - 0.5) * perturbationAmplitude;
            const perturbZ1 = (Math.random() - 0.5) * perturbationAmplitude;

            // Layer 2: Gaussian noise
            const gaussianNoise = () => {
                let u = 0, v = 0;
                while(u === 0) u = Math.random();
                while(v === 0) v = Math.random();
                return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            };

            const perturbX2 = gaussianNoise() * perturbationAmplitude * 0.5;
            const perturbY2 = gaussianNoise() * perturbationAmplitude * 0.5;
            const perturbZ2 = gaussianNoise() * perturbationAmplitude * 0.5;

            // Layer 3: Random angle rotation to break octree octant alignment
            const rotAngle = Math.random() * Math.PI * 2;
            const rotCos = Math.cos(rotAngle);
            const rotSin = Math.sin(rotAngle);

            pos.x += perturbX1 + perturbX2;
            pos.y += perturbY1 + perturbY2;
            pos.z += perturbZ1 + perturbZ2;

            // Rotate to break octant alignment
            const tempX = pos.x;
            pos.x = pos.x * rotCos - pos.y * rotSin;
            pos.y = tempX * rotSin + pos.y * rotCos;

            p.x[i] = pos.x;
            p.y[i] = pos.y;
            p.z[i] = pos.z;

            // Initial velocities: PURE RADIAL EXPANSION - all particles expand at same speed!
            // This creates a perfect spherical expansion from the Big Bang
            const distance = Math.sqrt(pos.x**2 + pos.y**2 + pos.z**2);

            if (distance > 1e-10) {
                // Normalize direction
                const invDist = 1.0 / distance;
                const dirX = pos.x * invDist;
                const dirY = pos.y * invDist;
                const dirZ = pos.z * invDist;

                // UNIFORM radial expansion speed - same for ALL particles
                const radialSpeed = 1.0;

                // TINY random perturbation (< 1%) to prevent exact symmetry
                const perturbFactor = 1.0 + (Math.random() - 0.5) * 0.01;

                p.vx[i] = dirX * radialSpeed * perturbFactor;
                p.vy[i] = dirY * radialSpeed * perturbFactor;
                p.vz[i] = dirZ * radialSpeed * perturbFactor;
            } else {
                // For particles exactly at origin, give random direction
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                p.vx[i] = Math.sin(phi) * Math.cos(theta);
                p.vy[i] = Math.sin(phi) * Math.sin(theta);
                p.vz[i] = Math.cos(phi);
            }

            // Mass: power-law distribution (Schechter-like)
            p.mass[i] = 1e10 * Math.pow(Math.random() + 0.1, -2.3);

            // Initial temperature: Planck temperature with slight variation
            p.temperature[i] = PLANCK.temperature * (0.9 + Math.random() * 0.2);

            // Age
            p.age[i] = 0;

            // Initial color: white (hot)
            p.colorR[i] = 255;
            p.colorG[i] = 255;
            p.colorB[i] = 255;

            // Brightness and size with random variation
            p.brightness[i] = 0.5 + Math.random() * 0.5;
            p.size[i] = 0.8 + Math.random() * 0.4;

            // No cluster assignment initially
            p.clusterId[i] = -1;

            // Previous positions (for motion blur)
            p.prevScreenX[i] = 0;
            p.prevScreenY[i] = 0;

            // All particles active and visible initially
            p.active[i] = 1;
            p.visible[i] = 1;

            // INITIALIZE VISUAL EVOLUTION PROPERTIES
            // Start with MAXIMUM blur, jitter, and size for early universe (superheated!)
            p.blur[i] = 3.0;  // Maximum blur - matches Planck epoch
            p.jitter[i] = 2.0;  // Maximum jitter
            p.baseSize[i] = 100.0;  // Very large - superheated appearance
        }

        // Calculate initial statistics
        this.updateStatistics();

        // Allow UI to update during initialization
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    /**
     * Generate position on/in a sphere
     */
    generateSphericalPosition(radius) {
        // Uniform distribution within sphere using rejection sampling alternative
        const r = radius * Math.cbrt(Math.random());
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        return new Vec3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
    }

    /**
     * Generate position on a grid
     */
    generateGridPosition(index, total, radius) {
        const sideLength = Math.ceil(Math.cbrt(total));
        const spacing = (2 * radius) / sideLength;

        const x = (index % sideLength) * spacing - radius;
        const y = (Math.floor(index / sideLength) % sideLength) * spacing - radius;
        const z = Math.floor(index / (sideLength * sideLength)) * spacing - radius;

        return new Vec3(x, y, z);
    }

    /**
     * Generate Gaussian (normal) distribution
     */
    generateGaussianPosition(radius) {
        const sigma = radius / 3;
        return new Vec3(
            Random.gaussian(0, sigma),
            Random.gaussian(0, sigma),
            Random.gaussian(0, sigma)
        );
    }

    /**
     * Generate dual cluster distribution for collision simulation
     */
    generateDualClusterPosition(index, total, radius) {
        const isSecondCluster = index >= total / 2;
        const offset = isSecondCluster ? radius : -radius;

        const pos = this.generateGaussianPosition(radius / 2);
        pos.x += offset;

        return pos;
    }

    /**
     * Convert temperature to RGB color
     * Based on black-body radiation / stellar classification
     */
    temperatureToColor(temp) {
        let r, g, b;

        if (temp > 30000) {
            // O-type stars: blue
            r = 68; g = 136; b = 255;
        } else if (temp > 10000) {
            // B-type stars: blue-white
            const t = (temp - 10000) / 20000;
            r = Math.floor(68 + 68 * (1 - t));
            g = Math.floor(136 + 51 * (1 - t));
            b = 255;
        } else if (temp > 7500) {
            // A-type stars: white
            r = 255;
            g = 255;
            b = 255;
        } else if (temp > 6000) {
            // F-type stars: yellow-white
            const t = (temp - 6000) / 1500;
            r = 255;
            g = Math.floor(255 - 35 * (1 - t));
            b = Math.floor(220 + 35 * t);
        } else if (temp > 5000) {
            // G-type stars: yellow (sun-like)
            const t = (temp - 5000) / 1000;
            r = 255;
            g = Math.floor(221 + 34 * t);
            b = Math.floor(136 + 84 * t);
        } else if (temp > 3500) {
            // K-type stars: orange
            const t = (temp - 3500) / 1500;
            r = 255;
            g = Math.floor(136 + 85 * t);
            b = Math.floor(68 + 68 * t);
        } else if (temp > 2500) {
            // M-type stars: red
            const t = (temp - 2500) / 1000;
            r = 255;
            g = Math.floor(68 + 68 * t);
            b = 68;
        } else if (temp > 100) {
            // Cool objects: deep red
            const t = Math.min(1, (temp - 100) / 2400);
            r = Math.floor(136 + 119 * t);
            g = Math.floor(34 + 34 * t);
            b = Math.floor(34 + 34 * t);
        } else if (temp > 10) {
            // Very cold: dim red
            const t = temp / 100;
            r = Math.floor(60 + 76 * t);
            g = Math.floor(15 + 19 * t);
            b = Math.floor(30 + 4 * t);
        } else {
            // Near absolute zero: almost black
            r = 30; g = 15; b = 40;
        }

        return {
            r: Math.min(255, Math.max(0, r)),
            g: Math.min(255, Math.max(0, g)),
            b: Math.min(255, Math.max(0, b))
        };
    }

    /**
     * Update particle colors based on temperature
     */
    updateColors() {
        const p = this.particles;
        const n = this.count;

        for (let i = 0; i < n; i++) {
            const color = this.temperatureToColor(p.temperature[i]);
            p.colorR[i] = color.r;
            p.colorG[i] = color.g;
            p.colorB[i] = color.b;
        }
    }

    /**
     * Update particle temperatures (cooling + heating)
     */
    updateTemperatures(dt, coolingRate, epoch) {
        const p = this.particles;
        const n = this.count;

        for (let i = 0; i < n; i++) {
            // Adiabatic cooling due to expansion
            p.temperature[i] *= (1 - coolingRate * dt);

            // Heating in dense regions (star formation)
            if (epoch && epoch.id !== 'planck' && epoch.id !== 'inflation') {
                const dist = Math.sqrt(p.x[i]**2 + p.y[i]**2 + p.z[i]**2);
                if (dist < 30) {
                    // More heating in denser central regions
                    const heatingFactor = 1 - dist / 30;
                    p.temperature[i] += Math.random() * 500 * heatingFactor * dt;
                }
            }

            // Clamp temperature
            p.temperature[i] = Math.max(2.725, Math.min(PLANCK.temperature, p.temperature[i]));
        }
    }

    /**
     * Update particle ages
     */
    updateAges(dt) {
        const p = this.particles;
        const n = this.count;

        for (let i = 0; i < n; i++) {
            p.age[i] += dt;
        }
    }

    /**
     * Calculate statistics for the particle system
     */
    updateStatistics() {
        const p = this.particles;
        const n = this.count;

        let sumTemp = 0;
        let minTemp = Infinity;
        let maxTemp = -Infinity;
        let sumMass = 0;
        let sumKE = 0;

        let blue = 0, white = 0, yellow = 0, orange = 0, red = 0;

        for (let i = 0; i < n; i++) {
            const temp = p.temperature[i];
            sumTemp += temp;
            if (temp < minTemp) minTemp = temp;
            if (temp > maxTemp) maxTemp = temp;

            sumMass += p.mass[i];

            const v2 = p.vx[i]**2 + p.vy[i]**2 + p.vz[i]**2;
            sumKE += 0.5 * p.mass[i] * v2;

            // Color distribution
            if (temp > 10000) blue++;
            else if (temp > 6000) white++;
            else if (temp > 4000) yellow++;
            else if (temp > 2500) orange++;
            else red++;
        }

        this.stats.avgTemperature = sumTemp / n;
        this.stats.minTemperature = minTemp;
        this.stats.maxTemperature = maxTemp;
        this.stats.totalMass = sumMass;
        this.stats.totalKineticEnergy = sumKE;

        this.stats.colorDistribution = {
            blue: (blue / n) * 100,
            white: (white / n) * 100,
            yellow: (yellow / n) * 100,
            orange: (orange / n) * 100,
            red: (red / n) * 100
        };
    }

    /**
     * Get position of particle at index
     */
    getPosition(index) {
        return new Vec3(
            this.particles.x[index],
            this.particles.y[index],
            this.particles.z[index]
        );
    }

    /**
     * Get velocity of particle at index
     */
    getVelocity(index) {
        return new Vec3(
            this.particles.vx[index],
            this.particles.vy[index],
            this.particles.vz[index]
        );
    }

    /**
     * Set position of particle at index
     */
    setPosition(index, pos) {
        this.particles.x[index] = pos.x;
        this.particles.y[index] = pos.y;
        this.particles.z[index] = pos.z;
    }

    /**
     * Set velocity of particle at index
     */
    setVelocity(index, vel) {
        this.particles.vx[index] = vel.x;
        this.particles.vy[index] = vel.y;
        this.particles.vz[index] = vel.z;
    }

    /**
     * Reset all particles to initial state
     */
    async reset() {
        await this.generateInitialConditions();
    }

    /**
     * Resize particle system
     */
    async resize(newCount) {
        this.count = newCount;
        this.activeCount = newCount;
        this.visibleCount = newCount;
        await this.initialize();
    }

    /**
     * Get particle info for display
     */
    getParticleInfo(index) {
        const p = this.particles;
        return {
            id: index,
            position: { x: p.x[index], y: p.y[index], z: p.z[index] },
            velocity: { x: p.vx[index], y: p.vy[index], z: p.vz[index] },
            mass: p.mass[index],
            temperature: p.temperature[index],
            age: p.age[index],
            color: { r: p.colorR[index], g: p.colorG[index], b: p.colorB[index] },
            brightness: p.brightness[index],
            clusterId: p.clusterId[index]
        };
    }

    /**
     * Get statistics for UI
     */
    getStats() {
        return {
            total: this.count,
            active: this.activeCount,
            visible: this.visibleCount,
            clusters: this.clusterCount,
            clusteredPercent: (this.clusteredParticleCount / this.count) * 100,
            ...this.stats
        };
    }

    /**
     * Initialize galaxy properties for a particle
     * Called when particle transitions to galaxy state
     */
    initializeGalaxy(index, nameGenerator = null) {
        const p = this.particles;

        // Generate name (will be set by name generator if provided)
        if (nameGenerator) {
            p.galaxyName[index] = nameGenerator.generate(index, p.mass[index], p.x[index], p.y[index], p.z[index]);
        } else {
            // Default catalog naming
            p.galaxyName[index] = 'GAL-' + String(index).padStart(6, '0');
        }

        // Determine galaxy type based on mass and environment
        p.galaxyType[index] = this.determineGalaxyType(p.mass[index]);

        // Set galaxy properties
        p.galaxyMass[index] = p.mass[index] * 1e9; // Convert to solar masses (approximate)
        p.galaxyRadius[index] = this.calculateGalaxyRadius(p.galaxyMass[index], p.galaxyType[index]);
        p.galaxySFR[index] = this.calculateSFR(p.galaxyMass[index], p.temperature[index]);
        p.galaxyMetallicity[index] = 0.02; // Solar metallicity (Z☉)
        p.galaxyAge[index] = 0; // Just formed

        // Reset visual evolution (sharp galaxy)
        p.blur[index] = 0.0;
        p.jitter[index] = 0.0;
        p.baseSize[index] = 1.0;
    }

    /**
     * Determine galaxy type based on mass
     * Distribution: ~70% spiral, ~20% elliptical, ~7% irregular, ~3% dwarf
     */
    determineGalaxyType(mass) {
        const random = Math.random();

        // Mass-dependent type selection
        if (mass > 5e10) {
            // Massive galaxies: more likely elliptical
            if (random < 0.4) return 1; // Elliptical
            if (random < 0.85) return 0; // Spiral
            return 2; // Irregular
        } else if (mass > 1e10) {
            // Medium mass: mostly spirals
            if (random < 0.75) return 0; // Spiral
            if (random < 0.9) return 1; // Elliptical
            return 2; // Irregular
        } else {
            // Low mass: dwarfs and irregulars
            if (random < 0.5) return 3; // Dwarf
            if (random < 0.8) return 2; // Irregular
            return 0; // Spiral
        }
    }

    /**
     * Calculate galaxy radius based on mass and type
     * Returns radius in kpc
     */
    calculateGalaxyRadius(mass, type) {
        // Empirical size-mass relation
        // R ~ M^0.14 for disks (Shen et al. 2003)
        const baseSizeKpc = Math.pow(mass / 1e10, 0.14) * 5.0; // kpc

        // Type-dependent size modifier
        const typeModifier = [
            1.0,   // Spiral: normal size
            0.7,   // Elliptical: more compact
            1.3,   // Irregular: more extended
            0.3    // Dwarf: very small
        ];

        return baseSizeKpc * typeModifier[type];
    }

    /**
     * Calculate star formation rate based on mass and temperature
     * Returns SFR in M☉/yr
     */
    calculateSFR(mass, temperature) {
        // Higher mass → higher SFR (roughly linear)
        // Higher temperature → higher SFR (star-forming regions are hot)
        const massFactor = mass / 1e10; // Normalize to 10^10 M☉
        const tempFactor = Math.min(temperature / 10000, 1.0); // Normalize, cap at 1

        // Typical SFR: 0.1 - 100 M☉/yr
        const sfr = massFactor * tempFactor * (0.5 + Math.random() * 1.5);

        return Math.max(0.01, Math.min(sfr, 1000)); // Clamp to reasonable range
    }

    /**
     * Merge two galaxies
     * Combines properties using mass-weighted averages
     */
    mergeGalaxies(index1, index2) {
        const p = this.particles;

        if (!p.active[index1] || !p.active[index2]) {
            console.warn('Cannot merge inactive particles');
            return false;
        }

        const totalMass = p.mass[index1] + p.mass[index2];
        const totalGalaxyMass = p.galaxyMass[index1] + p.galaxyMass[index2];

        // Mass-weighted average position
        p.x[index1] = (p.x[index1] * p.mass[index1] + p.x[index2] * p.mass[index2]) / totalMass;
        p.y[index1] = (p.y[index1] * p.mass[index1] + p.y[index2] * p.mass[index2]) / totalMass;
        p.z[index1] = (p.z[index1] * p.mass[index1] + p.z[index2] * p.mass[index2]) / totalMass;

        // Mass-weighted average velocity
        p.vx[index1] = (p.vx[index1] * p.mass[index1] + p.vx[index2] * p.mass[index2]) / totalMass;
        p.vy[index1] = (p.vy[index1] * p.mass[index1] + p.vy[index2] * p.mass[index2]) / totalMass;
        p.vz[index1] = (p.vz[index1] * p.mass[index1] + p.vz[index2] * p.mass[index2]) / totalMass;

        // Combined mass
        p.mass[index1] = totalMass;
        p.galaxyMass[index1] = totalGalaxyMass;

        // Merger properties
        // Major mergers (mass ratio < 4:1) → elliptical
        // Minor mergers → retain primary type
        const massRatio = Math.max(p.galaxyMass[index1], p.galaxyMass[index2]) /
                          Math.min(p.galaxyMass[index1], p.galaxyMass[index2]);

        if (massRatio < 4.0) {
            // Major merger → elliptical
            p.galaxyType[index1] = 1; // Elliptical
        }
        // else: minor merger, retain type of more massive galaxy

        // Combined star formation (merger triggers starburst)
        p.galaxySFR[index1] = p.galaxySFR[index1] + p.galaxySFR[index2] * 2.0; // Starburst factor

        // Mass-weighted metallicity
        p.galaxyMetallicity[index1] = (p.galaxyMetallicity[index1] * p.galaxyMass[index1] +
                                       p.galaxyMetallicity[index2] * p.galaxyMass[index2]) / totalGalaxyMass;

        // Age: younger of the two (merger resets age somewhat)
        p.galaxyAge[index1] = Math.min(p.galaxyAge[index1], p.galaxyAge[index2]);

        // Recalculate radius
        p.galaxyRadius[index1] = this.calculateGalaxyRadius(p.galaxyMass[index1], p.galaxyType[index1]);

        // Update name (append "merger")
        p.galaxyName[index1] = p.galaxyName[index1] + '+' + p.galaxyName[index2].split('-').pop();

        // Mark second particle as merged
        p.active[index2] = 0;
        p.visible[index2] = 0;
        p.mergedWith[index2] = index1;

        // Update counts
        this.activeCount--;

        return true;
    }

    /**
     * Bulk initialize all galaxies
     * Called when entering galaxy formation epoch
     */
    initializeAllGalaxies(nameGenerator) {
        const p = this.particles;
        for (let i = 0; i < this.count; i++) {
            if (p.active[i]) {
                this.initializeGalaxy(i, nameGenerator);
            }
        }
    }
}

export default ParticleSystem;
