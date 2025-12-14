/**
 * Physics Engine
 * Universe Evolution Simulator v2.47.3
 *
 * Coordinates gravity, expansion, and particle motion
 */

import { SIMULATION } from '../utils/constants.js';
import { Octree } from './Octree.js';
import { Cosmology } from './Cosmology.js';
import { ClusterDetector } from './ClusterDetector.js';

export class PhysicsEngine {
    constructor(config = {}) {
        // Physics parameters
        this.G = config.G ?? 0.0001;  // Scaled gravitational constant
        this.softening = config.softening ?? SIMULATION.softeningLength;
        this.theta = config.theta ?? SIMULATION.barnesHutTheta;

        // Integration settings
        this.integrationMethod = config.integrationMethod ?? 'verlet';
        this.useBarnesHut = config.useBarnesHut ?? true;
        this.useGridGravity = config.useGridGravity ?? true;  // Fallback for performance

        // Create components
        this.octree = new Octree({ theta: this.theta });
        this.cosmology = new Cosmology(config.cosmology);
        this.clusterDetector = new ClusterDetector({ gridSize: 30 });

        // Grid-based gravity (faster, less accurate)
        this.gravityGrid = null;
        this.gravityGridSize = 10;

        // Timing
        this.physicsTime = 0;
        this.gravityTime = 0;
        this.integrationTime = 0;
        this.expansionTime = 0;

        // Energy tracking
        this.kineticEnergy = 0;
        this.potentialEnergy = 0;
        this.totalEnergy = 0;
        this.energyDrift = 0;
        this.initialEnergy = null;

        // Virial ratio (2T/|U|)
        this.virialRatio = 0;

        // Detected clusters for visualization
        this.detectedClusters = [];
        this.clusterStats = null;
    }

    /**
     * Main physics update
     */
    update(particles, dt, timeSpeed, isReversed = false) {
        const physicsStart = performance.now();

        const scaledDt = dt * timeSpeed * (isReversed ? -1 : 1);

        // Update cosmology
        const cosmoState = this.cosmology.update(scaledDt, isReversed);

        // Apply physics throughout evolution
        if (!isReversed) {
            // Apply cosmic expansion (starts IMMEDIATELY - inflation!)
            const expansionStart = performance.now();
            this.applyExpansion(particles, scaledDt / timeSpeed);
            this.expansionTime = performance.now() - expansionStart;

            // Apply gravity after matter-radiation equality (~50,000 years)
            if (this.cosmology.time > 1.5e12) {
                const gravityStart = performance.now();

                // Use grid gravity for better performance with many particles
                if (particles.count <= 5000 && this.useBarnesHut) {
                    this.applyBarnesHutGravity(particles, scaledDt / timeSpeed);
                } else {
                    this.applyGridGravity(particles, scaledDt / timeSpeed);
                }

                this.gravityTime = performance.now() - gravityStart;
            }
        }

        // Integrate motion
        const integrationStart = performance.now();
        this.integrateMotion(particles, scaledDt / timeSpeed * 0.01);
        this.integrationTime = performance.now() - integrationStart;

        // Update particle temperatures
        this.updateTemperatures(particles, scaledDt);

        // Update particle colors
        particles.updateColors();

        // Update particle ages
        particles.updateAges(scaledDt);

        this.physicsTime = performance.now() - physicsStart;

        return {
            physicsTime: this.physicsTime,
            cosmologyState: cosmoState
        };
    }

    /**
     * Apply Hubble expansion to particles
     */
    applyExpansion(particles, dt) {
        const z = Math.min(this.cosmology.redshift, 1e10);
        const H = this.cosmology.hubbleParameter(z);

        // Scale expansion rate for simulation
        const expansionRate = H * 1e-6;

        // Clamp expansion to prevent numerical overflow
        // Maximum 10% expansion/contraction per frame
        const maxExpansion = 0.1;
        const clampedExpansion = Math.max(-maxExpansion, Math.min(maxExpansion, expansionRate * dt));

        const factor = 1 + clampedExpansion;
        const velocityFactor = 1 / (1 + clampedExpansion * 0.5);

        // Safety check: ensure factors are finite and reasonable
        if (!isFinite(factor) || !isFinite(velocityFactor) || factor <= 0) {
            console.warn('Invalid expansion factors, skipping expansion', { factor, velocityFactor, H, z });
            return;
        }

        const p = particles.particles;
        const n = particles.count;

        for (let i = 0; i < n; i++) {
            // Expand positions
            p.x[i] *= factor;
            p.y[i] *= factor;
            p.z[i] *= factor;

            // Adiabatic cooling of velocities
            p.vx[i] *= velocityFactor;
            p.vy[i] *= velocityFactor;
            p.vz[i] *= velocityFactor;
        }
    }

    /**
     * Apply gravity using Barnes-Hut octree (O(N log N))
     */
    applyBarnesHutGravity(particles, dt) {
        const p = particles.particles;
        const n = particles.count;

        // Build octree
        this.octree.build(p, n);

        // Calculate and apply forces
        const softeningSq = this.softening * this.softening;

        for (let i = 0; i < n; i++) {
            // Skip particles with invalid positions
            if (!isFinite(p.x[i]) || !isFinite(p.y[i]) || !isFinite(p.z[i])) {
                continue;
            }

            const force = this.octree.calculateForce(i, p, this.G, softeningSq);

            // Safety check: ensure force is finite
            if (!isFinite(force.x) || !isFinite(force.y) || !isFinite(force.z)) {
                continue;
            }

            // Apply acceleration (F = ma, a = F/m)
            const invMass = 1 / p.mass[i];
            const dvx = force.x * invMass * dt;
            const dvy = force.y * invMass * dt;
            const dvz = force.z * invMass * dt;

            // Clamp acceleration to prevent numerical instability
            const maxDv = 100; // Maximum velocity change per frame
            p.vx[i] += Math.max(-maxDv, Math.min(maxDv, dvx));
            p.vy[i] += Math.max(-maxDv, Math.min(maxDv, dvy));
            p.vz[i] += Math.max(-maxDv, Math.min(maxDv, dvz));
        }
    }

    /**
     * Apply gravity using grid-based approximation (faster for large N)
     */
    applyGridGravity(particles, dt) {
        const p = particles.particles;
        const n = particles.count;
        const gridSize = this.gravityGridSize;
        const cellSize = 200 / gridSize;
        const gridCells = gridSize * gridSize * gridSize;

        // Initialize grid
        const gridMass = new Float32Array(gridCells);
        const gridCOMx = new Float32Array(gridCells);
        const gridCOMy = new Float32Array(gridCells);
        const gridCOMz = new Float32Array(gridCells);

        // Accumulate mass into grid (sample every 10th particle for performance)
        const sampleRate = 10;
        for (let i = 0; i < n; i += sampleRate) {
            const gx = Math.floor((p.x[i] + 100) / cellSize);
            const gy = Math.floor((p.y[i] + 100) / cellSize);
            const gz = Math.floor((p.z[i] + 100) / cellSize);

            if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize && gz >= 0 && gz < gridSize) {
                const idx = gx + gy * gridSize + gz * gridSize * gridSize;
                const mass = p.mass[i] * sampleRate;  // Scale for sampling
                gridMass[idx] += mass;
                gridCOMx[idx] += p.x[i] * mass;
                gridCOMy[idx] += p.y[i] * mass;
                gridCOMz[idx] += p.z[i] * mass;
            }
        }

        // Normalize centers of mass
        for (let i = 0; i < gridCells; i++) {
            if (gridMass[i] > 0) {
                gridCOMx[i] /= gridMass[i];
                gridCOMy[i] /= gridMass[i];
                gridCOMz[i] /= gridMass[i];
            }
        }

        // Apply forces (sample particles for performance)
        const updateRate = 100;
        const softeningSq = this.softening * this.softening;

        for (let i = 0; i < n; i += updateRate) {
            let ax = 0, ay = 0, az = 0;

            for (let j = 0; j < gridCells; j++) {
                if (gridMass[j] > 0) {
                    const dx = gridCOMx[j] - p.x[i];
                    const dy = gridCOMy[j] - p.y[i];
                    const dz = gridCOMz[j] - p.z[i];
                    const distSq = dx*dx + dy*dy + dz*dz + softeningSq;
                    const dist = Math.sqrt(distSq);
                    const force = this.G * gridMass[j] / distSq;

                    ax += force * dx / dist;
                    ay += force * dy / dist;
                    az += force * dz / dist;
                }
            }

            // Apply to this particle and nearby ones
            for (let k = i; k < Math.min(i + updateRate, n); k++) {
                p.vx[k] += ax * dt;
                p.vy[k] += ay * dt;
                p.vz[k] += az * dt;
            }
        }
    }

    /**
     * Integrate particle motion (Velocity Verlet)
     */
    integrateMotion(particles, dt) {
        const p = particles.particles;
        const n = particles.count;

        for (let i = 0; i < n; i++) {
            // Safety check: ensure velocities and positions are finite
            if (!isFinite(p.vx[i])) p.vx[i] = 0;
            if (!isFinite(p.vy[i])) p.vy[i] = 0;
            if (!isFinite(p.vz[i])) p.vz[i] = 0;

            // Integrate position
            const dx = p.vx[i] * dt;
            const dy = p.vy[i] * dt;
            const dz = p.vz[i] * dt;

            // Clamp maximum movement per frame
            const maxMove = 50;
            p.x[i] += Math.max(-maxMove, Math.min(maxMove, dx));
            p.y[i] += Math.max(-maxMove, Math.min(maxMove, dy));
            p.z[i] += Math.max(-maxMove, Math.min(maxMove, dz));

            // Final safety check
            if (!isFinite(p.x[i])) p.x[i] = 0;
            if (!isFinite(p.y[i])) p.y[i] = 0;
            if (!isFinite(p.z[i])) p.z[i] = 0;
        }
    }

    /**
     * Update particle temperatures based on cosmology
     */
    updateTemperatures(particles, dt) {
        const epoch = this.cosmology.currentEpoch;

        // Cooling rate varies with epoch
        let coolingRate = 0.0005;

        if (epoch) {
            if (epoch.id === 'planck' || epoch.id === 'inflation') {
                coolingRate = 0.01;  // Rapid cooling in early universe
            } else if (epoch.id === 'qgp' || epoch.id === 'nucleosynthesis') {
                coolingRate = 0.005;
            } else if (epoch.id === 'darkages') {
                coolingRate = 0.001;
            }
        }

        particles.updateTemperatures(dt / this.cosmology.time || 1, coolingRate, epoch);
    }

    /**
     * Calculate system energy for conservation check
     */
    calculateEnergy(particles) {
        const p = particles.particles;
        const n = particles.count;

        // Kinetic energy
        let KE = 0;
        for (let i = 0; i < n; i++) {
            const v2 = p.vx[i]**2 + p.vy[i]**2 + p.vz[i]**2;
            KE += 0.5 * p.mass[i] * v2;
        }

        // Potential energy (approximate using grid)
        let PE = 0;
        // Skip for performance - would require O(N^2) calculation

        this.kineticEnergy = KE;
        this.potentialEnergy = PE;
        this.totalEnergy = KE + PE;

        if (this.initialEnergy === null && KE > 0) {
            this.initialEnergy = this.totalEnergy;
        }

        if (this.initialEnergy !== null && this.initialEnergy !== 0) {
            this.energyDrift = Math.abs(this.totalEnergy - this.initialEnergy) / Math.abs(this.initialEnergy) * 100;
        }

        // Virial ratio (for bound systems: 2T/|U| = 1)
        if (PE !== 0) {
            this.virialRatio = 2 * KE / Math.abs(PE);
        }
    }

    /**
     * Detect clusters using advanced cluster detector
     */
    detectClusters(particles) {
        // Use the cluster detector
        this.clusterStats = this.clusterDetector.detect(particles);

        // Get structures for visualization
        const structures = this.clusterDetector.getStructures();
        this.detectedClusters = structures.clusters;

        // Update particle statistics
        particles.clusterCount = this.clusterStats.clusterCount;
        particles.clusteredParticleCount = Math.min(
            particles.count,
            this.clusterStats.clusterCount * particles.count / 100
        );

        return this.clusterStats;
    }

    /**
     * Get detected clusters for visualization
     */
    getClusters() {
        return this.detectedClusters;
    }

    /**
     * Get top N densest clusters
     */
    getTopClusters(count = 10) {
        return this.clusterDetector.getTopClusters(count);
    }

    /**
     * Set physics parameters
     */
    setParameters(params) {
        if (params.G !== undefined) this.G = params.G;
        if (params.softening !== undefined) this.softening = params.softening;
        if (params.theta !== undefined) {
            this.theta = params.theta;
            this.octree.setTheta(params.theta);
        }
        if (params.useBarnesHut !== undefined) this.useBarnesHut = params.useBarnesHut;
    }

    /**
     * Get physics state for UI
     */
    getState() {
        return {
            physicsTime: this.physicsTime,
            gravityTime: this.gravityTime,
            integrationTime: this.integrationTime,
            expansionTime: this.expansionTime,
            kineticEnergy: this.kineticEnergy,
            potentialEnergy: this.potentialEnergy,
            totalEnergy: this.totalEnergy,
            energyDrift: this.energyDrift,
            virialRatio: this.virialRatio,
            integrationMethod: this.integrationMethod,
            theta: this.theta,
            softening: this.softening,
            octreeStats: this.octree.getStats()
        };
    }

    /**
     * Reset physics state
     */
    reset() {
        this.cosmology.reset();
        this.initialEnergy = null;
        this.energyDrift = 0;
    }
}

export default PhysicsEngine;
