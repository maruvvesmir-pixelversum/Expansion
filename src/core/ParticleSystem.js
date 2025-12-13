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
            visible: new Uint8Array(n)
        };

        console.log('Particle arrays created:', {
            xArrayLength: this.particles.x.length,
            yArrayLength: this.particles.y.length,
            zArrayLength: this.particles.z.length,
            firstX: this.particles.x[0],
            firstY: this.particles.y[0],
            firstZ: this.particles.z[0]
        });

        await this.generateInitialConditions();
    }

    /**
     * Generate initial particle distribution
     */
    async generateInitialConditions(config = {}) {
        const {
            distribution = 'spherical',
            radius = 50,
            perturbationAmplitude = SIMULATION.perturbationAmplitude,
            hubbleVelocity = 0.001,
            thermalVelocity = 0.1
        } = config;

        const n = this.count;
        const p = this.particles;

        for (let i = 0; i < n; i++) {
            // Generate position based on distribution type
            let pos;
            switch (distribution) {
                case 'grid':
                    pos = this.generateGridPosition(i, n, radius);
                    break;
                case 'gaussian':
                    pos = this.generateGaussianPosition(radius);
                    break;
                case 'dual_cluster':
                    pos = this.generateDualClusterPosition(i, n, radius);
                    break;
                case 'spherical':
                default:
                    pos = this.generateSphericalPosition(radius);
                    break;
            }

            // Add primordial perturbations
            pos.x += (Math.random() - 0.5) * perturbationAmplitude * radius;
            pos.y += (Math.random() - 0.5) * perturbationAmplitude * radius;
            pos.z += (Math.random() - 0.5) * perturbationAmplitude * radius;

            p.x[i] = pos.x;
            p.y[i] = pos.y;
            p.z[i] = pos.z;

            // Debug first particle
            if (i === 0) {
                console.log('First particle generation:', {
                    pos: { x: pos.x, y: pos.y, z: pos.z },
                    stored: { x: p.x[i], y: p.y[i], z: p.z[i] },
                    distribution: distribution,
                    radius: radius
                });
            }

            // Initial velocities: Hubble flow + thermal
            p.vx[i] = pos.x * hubbleVelocity + (Math.random() - 0.5) * thermalVelocity;
            p.vy[i] = pos.y * hubbleVelocity + (Math.random() - 0.5) * thermalVelocity;
            p.vz[i] = pos.z * hubbleVelocity + (Math.random() - 0.5) * thermalVelocity;

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
        }

        // Calculate initial statistics
        this.updateStatistics();

        // Debug: Check final state
        console.log('Particle generation complete:', {
            count: n,
            firstParticle: {
                x: p.x[0],
                y: p.y[0],
                z: p.z[0],
                vx: p.vx[0],
                vy: p.vy[0],
                vz: p.vz[0],
                mass: p.mass[0],
                temp: p.temperature[0]
            },
            lastParticle: {
                x: p.x[n-1],
                y: p.y[n-1],
                z: p.z[n-1]
            }
        });

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
}

export default ParticleSystem;
