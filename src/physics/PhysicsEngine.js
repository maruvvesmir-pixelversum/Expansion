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
import { SpatialHash } from './SpatialHash.js';
import { TemporalPhysics } from './TemporalPhysics.js';

export class PhysicsEngine {
    constructor(config = {}) {
        // Physics parameters - DISABLED GRAVITY for early universe
        this.G = config.G ?? 0.0000000001;  // 100x weaker! Almost no gravity!
        this.maxGravityDistance = config.maxGravityDistance ?? 0.5;  // EXTREMELY short range - only touching particles
        this.softening = config.softening ?? SIMULATION.softeningLength;
        this.theta = config.theta ?? SIMULATION.barnesHutTheta;

        // Integration settings
        this.integrationMethod = config.integrationMethod ?? 'verlet';
        this.useBarnesHut = config.useBarnesHut ?? true;
        this.useGridGravity = config.useGridGravity ?? false;  // DISABLED - grid gravity creates 4-point clustering artifacts!

        // PERFORMANCE: Adaptive physics update intervals
        this.gravityUpdateInterval = config.gravityUpdateInterval ?? 5;  // Update every 5 frames
        this.gravityFrameCounter = 0;
        this.adaptivePhysics = true;  // Enable adaptive physics for 60 FPS
        this.targetFPS = 60;
        this.currentFPS = 60;
        this.physicsQuality = 1.0;  // 1.0 = full quality, lower = faster but less accurate

        // Create components
        this.octree = new Octree({ theta: this.theta });
        this.cosmology = new Cosmology(config.cosmology);
        this.clusterDetector = new ClusterDetector({ gridSize: 30 });

        // Performance optimization systems for 1M particles
        this.spatialHash = new SpatialHash(10.0);  // O(N) neighbor queries
        this.temporalPhysics = new TemporalPhysics();  // Temporal updates
        this.useOptimizations = config.useOptimizations ?? true;

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
     * Main physics update with ADAPTIVE PERFORMANCE
     */
    update(particles, dt, timeSpeed, isReversed = false, currentFPS = 60) {
        const physicsStart = performance.now();

        // PERFORMANCE: Adaptive quality based on FPS
        if (this.adaptivePhysics) {
            this.currentFPS = currentFPS;
            if (currentFPS < 45) {
                // Dropping below 45 FPS - reduce quality
                this.physicsQuality = Math.max(0.5, this.physicsQuality - 0.05);
                this.gravityUpdateInterval = Math.min(15, this.gravityUpdateInterval + 1);  // Max 15 frames between updates
            } else if (currentFPS > 55 && this.physicsQuality < 1.0) {
                // Above 55 FPS - increase quality back up
                this.physicsQuality = Math.min(1.0, this.physicsQuality + 0.02);
                this.gravityUpdateInterval = Math.max(5, this.gravityUpdateInterval - 1);  // Minimum 5 frames
            }
        }

        const scaledDt = dt * timeSpeed * (isReversed ? -1 : 1);

        // Update cosmology
        const cosmoState = this.cosmology.update(scaledDt, isReversed);

        // Apply physics throughout evolution
        if (!isReversed) {
            // Apply cosmic expansion (starts IMMEDIATELY - inflation!)
            const expansionStart = performance.now();
            this.applyExpansion(particles, scaledDt / timeSpeed);
            this.expansionTime = performance.now() - expansionStart;

            // DISABLE gravity for early universe to prevent clustering!
            // Only enable after 1 billion years to allow pure spherical expansion
            const gravityStartTime = 3.156e16; // 1 billion years in seconds

            if (this.cosmology.time > gravityStartTime) {
                const gravityStart = performance.now();

                // Gradually ramp up gravity over 1 billion years
                const rampUpDuration = 3.156e16; // 1 billion years
                const timeSinceStart = this.cosmology.time - gravityStartTime;
                const gravityFactor = Math.min(1.0, timeSinceStart / rampUpDuration);

                // Only apply gravity if factor is significant
                if (gravityFactor > 0.01) {
                    // OPTIMIZATION: Update gravity every N frames for better performance
                    this.gravityFrameCounter++;
                    const shouldUpdateGravity = (this.gravityFrameCounter % this.gravityUpdateInterval === 0);

                    if (shouldUpdateGravity) {
                        // Debug logging for gravity activation (log every 100 frames)
                        if (!this._gravityFrameCount) this._gravityFrameCount = 0;
                        this._gravityFrameCount++;
                        if (this._gravityFrameCount % 100 === 0) {
                            const ageYears = (this.cosmology.time / 3.156e7).toFixed(0);
                            console.log(`⚡ GRAVITY: age=${ageYears}yr, factor=${(gravityFactor*100).toFixed(1)}%, maxDist=${this.maxGravityDistance}`);
                        }

                        // Temporarily scale G for ramp-up
                        const originalG = this.G;
                        this.G = originalG * gravityFactor;

                        // CRITICAL: Use Barnes-Hut with distance cutoff to prevent 4-point clustering
                        // Grid gravity is DISABLED because it creates symmetrical artifacts
                        this.applyBarnesHutGravity(particles, scaledDt / timeSpeed * this.gravityUpdateInterval);

                        // Restore original G
                        this.G = originalG;
                    }
                }

                this.gravityTime = performance.now() - gravityStart;
            }
        }

        // Integrate motion with very small timestep to prevent jumps
        // Using smaller factor (0.001 instead of 0.01) for smoother motion
        const integrationStart = performance.now();
        this.integrateMotion(particles, scaledDt / timeSpeed * 0.001);
        this.integrationTime = performance.now() - integrationStart;

        // ULTRA PERFORMANCE: Update temperatures, colors, and ages adaptively
        // These don't need to be updated every frame for visual quality
        if (!this._visualUpdateCounter) this._visualUpdateCounter = 0;
        this._visualUpdateCounter++;

        // Adaptive visual update frequency based on performance
        const visualUpdateInterval = this.physicsQuality > 0.8 ? 3 : 5;  // 3-5 frames (was too aggressive!)
        const shouldUpdateVisuals = (this._visualUpdateCounter % visualUpdateInterval === 0);

        if (shouldUpdateVisuals) {
            // Update particle temperatures
            this.updateTemperatures(particles, scaledDt * visualUpdateInterval);  // Scale by update interval

            // Update particle colors
            particles.updateColors();

            // Update particle ages
            particles.updateAges(scaledDt * visualUpdateInterval);  // Scale by update interval
        }

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
        // Clamp redshift to reasonable range (z > 1e6 is extremely early universe)
        const z = Math.min(this.cosmology.redshift, 1e6);

        // Skip expansion if redshift is too extreme or invalid
        if (!isFinite(z) || z > 1e6) {
            return; // Too early in universe, skip expansion
        }

        const H = this.cosmology.hubbleParameter(z);

        // Safety check: ensure H is valid
        if (!isFinite(H) || H <= 0) {
            return; // Invalid Hubble parameter, skip
        }

        // Scale expansion rate for simulation - MAXIMUM EXPANSION
        const expansionRate = H * 0.1;  // 100x stronger than original! Universe expands extremely rapidly!

        // Clamp expansion to prevent numerical overflow
        // Maximum 95% expansion per frame - very aggressive expansion
        const maxExpansion = 0.95;
        const clampedExpansion = Math.max(-maxExpansion, Math.min(maxExpansion, expansionRate * dt));

        const factor = 1 + clampedExpansion;
        const velocityFactor = 1 / (1 + clampedExpansion * 0.5);

        // Safety check: ensure factors are finite and reasonable
        if (!isFinite(factor) || !isFinite(velocityFactor) || factor <= 0) {
            return; // Invalid factors, skip
        }

        // DEBUG: Log expansion every 200 frames (reduced frequency)
        if (!this._expansionFrameCount) this._expansionFrameCount = 0;
        this._expansionFrameCount++;
        if (this._expansionFrameCount % 200 === 0) {
            const ageYears = (this.cosmology.time / 3.156e7).toFixed(0);
            console.log(`🌍 EXPANSION: age=${ageYears}yr, factor=${factor.toFixed(6)}, z=${z.toFixed(1)}`);

            // Debug: Track first 4 particle positions to detect clustering
            const p = particles.particles;
            const positions = [];
            for (let i = 0; i < Math.min(4, n); i++) {
                positions.push(`[${p.x[i].toFixed(2)}, ${p.y[i].toFixed(2)}, ${p.z[i].toFixed(2)}]`);
            }
            console.log(`   First 4 particle positions: ${positions.join(', ')}`);

            // Calculate average distance from origin
            let avgDist = 0;
            for (let i = 0; i < Math.min(100, n); i++) {
                avgDist += Math.sqrt(p.x[i]**2 + p.y[i]**2 + p.z[i]**2);
            }
            avgDist /= Math.min(100, n);
            console.log(`   Average distance from origin: ${avgDist.toFixed(2)}`);
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
     * WITH DISTANCE CUTOFF - only short-range gravity to prevent clustering!
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

            // CRITICAL: Pass maxGravityDistance to enforce short-range gravity only!
            // This prevents particles from clustering into 4 points
            const force = this.octree.calculateForce(i, p, this.G, softeningSq, this.maxGravityDistance);

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

            // Clamp maximum movement per frame to prevent discontinuities
            // Reduced from 50 to 10 for smoother motion
            const maxMove = 10;
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
