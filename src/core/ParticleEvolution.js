/**
 * Particle Evolution System
 * Universe Evolution Simulator v3.0.0
 *
 * Manages particle state transitions and property interpolation
 * Controls visual evolution from energy → plasma → galaxies
 */

import { PARTICLE_STATES } from '../data/detailedEpochs.js';
import { GalaxyNameGenerator } from '../utils/GalaxyNameGenerator.js';

export class ParticleEvolution {
    constructor(particleSystem, cosmology) {
        this.particles = particleSystem;
        this.cosmology = cosmology;

        // Track initialization state
        this.galaxiesInitialized = false;
        this.nameGenerator = new GalaxyNameGenerator();

        // Previous epoch for detecting transitions
        this.previousEpoch = null;
    }

    /**
     * Set galaxy name generator
     */
    setNameGenerator(generator) {
        this.nameGenerator = generator;
    }

    /**
     * Main update function
     * Called every frame to evolve particle visual properties
     */
    update(dt, currentEpoch, nextEpoch, epochProgress) {
        if (!currentEpoch || !nextEpoch) return;

        // Detect epoch transitions
        const epochChanged = this.previousEpoch !== currentEpoch;
        if (epochChanged) {
            this.onEpochChange(this.previousEpoch, currentEpoch);
            this.previousEpoch = currentEpoch;
        }

        // Update visual properties for all particles
        this.updateVisualProperties(currentEpoch, nextEpoch, epochProgress);

        // Handle galaxy formation transition
        if (currentEpoch.galaxyFormation && !this.galaxiesInitialized) {
            this.initializeGalaxies();
        }
    }

    /**
     * Handle epoch transition events
     */
    onEpochChange(previousEpoch, newEpoch) {
        // Check if we should trigger particle splitting
        if (this.shouldSplitParticles(previousEpoch, newEpoch)) {
            this.performParticleSplitting(newEpoch);
        }
    }

    /**
     * Determine if particles should split during this epoch transition
     */
    shouldSplitParticles(previousEpoch, newEpoch) {
        if (!previousEpoch || !newEpoch) return false;

        // Split during major cooling/condensation transitions
        const splittingTransitions = [
            { from: 'qgp_cooling', to: 'hadronization' },  // QGP condensing
            { from: 'lepton', to: 'nucleosynthesis_deuterium' },  // Nucleosynthesis
            { from: 'photon_epoch', to: 'matter_radiation_equality' },  // Matter dominance
            { from: 'last_scattering', to: 'dark_ages_early' },  // CMB release
            { from: 'gravitational_collapse', to: 'first_stars' },  // Star formation
            { from: 'protogalaxies', to: 'first_galaxies' }  // Galaxy formation
        ];

        return splittingTransitions.some(t =>
            previousEpoch.id === t.from && newEpoch.id === t.to
        );
    }

    /**
     * Split particles to simulate condensation and structure formation
     * Large blurry particles → multiple smaller sharp particles
     */
    performParticleSplitting(newEpoch) {
        const p = this.particles.particles;
        const n = this.particles.count;
        const maxParticles = this.particles.maxParticles;

        // Count active particles
        let activeCount = 0;
        for (let i = 0; i < n; i++) {
            if (p.active[i]) activeCount++;
        }

        // Don't split if we're near capacity
        if (activeCount > maxParticles * 0.8) {
            console.log('⚠️ Skipping particle split - near capacity');
            return;
        }

        // Splitting parameters
        const splitProbability = 0.3;  // 30% of particles split
        const minSplitCount = 2;
        const maxSplitCount = 3;
        const splitRadius = 2.0;  // How far apart split particles spawn

        let splitCount = 0;
        let newParticleIndex = n;

        // Iterate through existing particles
        for (let i = 0; i < n && newParticleIndex < maxParticles; i++) {
            if (!p.active[i]) continue;

            // Random split chance
            if (Math.random() > splitProbability) continue;

            // Determine how many particles to split into
            const numSplits = minSplitCount + Math.floor(Math.random() * (maxSplitCount - minSplitCount + 1));

            // Create new particles from this parent
            for (let j = 0; j < numSplits && newParticleIndex < maxParticles; j++) {
                // Random offset from parent
                const angle = (j / numSplits) * Math.PI * 2 + Math.random() * 0.5;
                const distance = splitRadius * (0.5 + Math.random() * 0.5);
                const offsetX = Math.cos(angle) * distance;
                const offsetY = Math.sin(angle) * distance;
                const offsetZ = (Math.random() - 0.5) * distance;

                // Create new particle
                p.active[newParticleIndex] = true;
                p.x[newParticleIndex] = p.x[i] + offsetX;
                p.y[newParticleIndex] = p.y[i] + offsetY;
                p.z[newParticleIndex] = p.z[i] + offsetZ;

                // Inherit velocity with slight variation
                p.vx[newParticleIndex] = p.vx[i] + (Math.random() - 0.5) * 0.1;
                p.vy[newParticleIndex] = p.vy[i] + (Math.random() - 0.5) * 0.1;
                p.vz[newParticleIndex] = p.vz[i] + (Math.random() - 0.5) * 0.1;

                // Inherit other properties
                p.mass[newParticleIndex] = p.mass[i] / numSplits;  // Divide mass
                p.temperature[newParticleIndex] = p.temperature[i];

                // Smaller and sharper
                p.baseSize[newParticleIndex] = newEpoch.particleSize * 0.8;
                p.blur[newParticleIndex] = newEpoch.particleBlur * 0.5;
                p.jitter[newParticleIndex] = newEpoch.particleJitter;

                // Copy color
                p.colorR[newParticleIndex] = p.colorR[i];
                p.colorG[newParticleIndex] = p.colorG[i];
                p.colorB[newParticleIndex] = p.colorB[i];
                p.brightness[newParticleIndex] = p.brightness[i];

                newParticleIndex++;
                splitCount++;
            }

            // Deactivate parent particle (it split into children)
            p.active[i] = false;
        }

        // Update particle count
        this.particles.count = Math.max(this.particles.count, newParticleIndex);

        console.log(`✨ Particle split: ${splitCount} new particles created (epoch: ${newEpoch.name})`);
    }

    /**
     * Update visual properties (blur, jitter, size) for all particles
     * Interpolates between current and next epoch based on progress
     * ULTRA SMOOTH transitions - no jumps, no darkening!
     */
    updateVisualProperties(currentEpoch, nextEpoch, progress) {
        const p = this.particles.particles;
        const n = this.particles.count;

        // Get epoch visual properties with safety checks
        const currentBlur = currentEpoch.particleBlur ?? 0;
        const nextBlur = nextEpoch.particleBlur ?? 0;
        const currentJitter = currentEpoch.particleJitter ?? 0;
        const nextJitter = nextEpoch.particleJitter ?? 0;
        const currentSize = currentEpoch.particleSize ?? 1;
        const nextSize = nextEpoch.particleSize ?? 1;

        // Interpolate with ULTRA SMOOTH easing to prevent jumps
        // Use slower easing for extremely smooth transitions
        const easedProgress = this.easeInOutCubic(progress);

        const targetBlur = this.lerp(currentBlur, nextBlur, easedProgress);
        const targetJitter = this.lerp(currentJitter, nextJitter, easedProgress);
        const targetSize = this.lerp(currentSize, nextSize, easedProgress);

        // Apply to all active particles with ULTRA SMOOTH interpolation
        for (let i = 0; i < n; i++) {
            if (!p.active[i]) continue;

            // VERY SMOOTH interpolation toward target values
            // Using smaller smoothing factor for ultra-smooth transitions
            const smoothFactor = 0.05; // Half the previous value - 2x smoother!

            // Apply smooth interpolation
            p.blur[i] += (targetBlur - p.blur[i]) * smoothFactor;
            p.jitter[i] += (targetJitter - p.jitter[i]) * smoothFactor;
            p.baseSize[i] += (targetSize - p.baseSize[i]) * smoothFactor;

            // Clamp to prevent negative values that could cause darkening
            p.blur[i] = Math.max(0, p.blur[i]);
            p.jitter[i] = Math.max(0, p.jitter[i]);
            p.baseSize[i] = Math.max(0.1, p.baseSize[i]); // Minimum size to prevent disappearing

            // Also update the size array for rendering
            p.size[i] = p.baseSize[i];
        }
    }

    /**
     * Initialize all galaxies when entering galaxy formation epoch
     */
    initializeGalaxies() {
        console.log('Initializing galaxies for all particles...');

        const startTime = performance.now();

        // Initialize galaxy properties for all active particles
        this.particles.initializeAllGalaxies(this.nameGenerator);

        const duration = performance.now() - startTime;
        console.log(`Galaxy initialization complete: ${this.particles.activeCount} galaxies in ${duration.toFixed(1)}ms`);

        this.galaxiesInitialized = true;
    }

    /**
     * Interpolate between current and next epoch properties
     */
    interpolateProperty(current, next, progress, easingFunc = 'easeInOutCubic') {
        const t = this[easingFunc](progress);
        return current + (next - current) * t;
    }

    /**
     * Linear interpolation
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Easing function: ease in-out cubic
     * Smooth acceleration and deceleration
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Easing function: ease out quad
     * Fast start, slow end
     */
    easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    }

    /**
     * Easing function: ease in quad
     * Slow start, fast end
     */
    easeInQuad(t) {
        return t * t;
    }

    /**
     * Get particle state for a given epoch
     */
    getParticleState(epoch) {
        return epoch.particleState || PARTICLE_STATES.ENERGY;
    }

    /**
     * Get particle color based on epoch and particle properties
     */
    getParticleColor(particle, epoch) {
        // Use epoch color as base
        const baseColor = epoch.color || { r: 255, g: 255, b: 255 };

        // Modify based on particle temperature (if in galaxy phase)
        if (epoch.galaxyFormation) {
            // Use temperature-based coloring for galaxies
            return this.particles.temperatureToColor(particle.temperature);
        }

        // For early epochs, use epoch color with temperature tint
        const tempFactor = Math.min(particle.temperature / epoch.temperature, 2.0);
        return {
            r: Math.min(255, baseColor.r * tempFactor),
            g: Math.min(255, baseColor.g * tempFactor),
            b: Math.min(255, baseColor.b * tempFactor)
        };
    }

    /**
     * Get effective particle size including blur and base size
     */
    getEffectiveSize(particleIndex) {
        const p = this.particles.particles;
        const baseSize = p.baseSize[particleIndex];
        const blur = p.blur[particleIndex];

        // Size increases with blur (blurry particles appear larger)
        return baseSize * (1.0 + blur * 2.0);
    }

    /**
     * Check if particle should be rendered in current epoch
     */
    shouldRenderParticle(particleIndex, epoch) {
        const p = this.particles.particles;

        // Always render active particles
        if (!p.active[particleIndex]) return false;

        // In galaxy epoch, don't render merged particles
        if (epoch.galaxyFormation && p.mergedWith[particleIndex] >= 0) {
            return false;
        }

        return true;
    }

    /**
     * Get render mode for current epoch
     */
    getRenderMode(epoch) {
        return epoch.renderMode || 'particles';
    }

    /**
     * Apply jitter offset to particle position (for rendering only)
     * Returns offset vector
     */
    getJitterOffset(particleIndex, frameCount = 0) {
        const p = this.particles.particles;
        const jitter = p.jitter[particleIndex];

        if (jitter < 0.01) {
            return { x: 0, y: 0, z: 0 };
        }

        // Use particle index and frame count for deterministic but varying jitter
        const seed = particleIndex * 1000 + Math.floor(frameCount / 10);
        const pseudo = Math.sin(seed) * 10000;
        const randomX = (pseudo % 1.0) - 0.5;
        const randomY = (Math.sin(seed * 1.1) * 10000 % 1.0) - 0.5;
        const randomZ = (Math.sin(seed * 1.2) * 10000 % 1.0) - 0.5;

        const jitterAmount = jitter * 0.5; // Jitter amount in simulation units

        return {
            x: randomX * jitterAmount,
            y: randomY * jitterAmount,
            z: randomZ * jitterAmount
        };
    }

    /**
     * Update particle ages based on epoch
     */
    updateParticleAges(dt, epoch) {
        if (!epoch.galaxyFormation) return;

        const p = this.particles.particles;
        const n = this.particles.count;

        // Convert dt to Gyr for galaxy ages
        const dtGyr = dt / 3.154e16; // seconds to Gyr

        for (let i = 0; i < n; i++) {
            if (p.active[i] && p.galaxyAge[i] !== undefined) {
                p.galaxyAge[i] += dtGyr;
            }
        }
    }

    /**
     * Get statistics about current particle evolution state
     */
    getStats() {
        const p = this.particles.particles;
        const n = this.particles.count;

        let avgBlur = 0;
        let avgJitter = 0;
        let avgSize = 0;
        let activeCount = 0;

        for (let i = 0; i < n; i++) {
            if (p.active[i]) {
                avgBlur += p.blur[i];
                avgJitter += p.jitter[i];
                avgSize += p.baseSize[i];
                activeCount++;
            }
        }

        if (activeCount > 0) {
            avgBlur /= activeCount;
            avgJitter /= activeCount;
            avgSize /= activeCount;
        }

        return {
            galaxiesInitialized: this.galaxiesInitialized,
            activeParticles: activeCount,
            avgBlur,
            avgJitter,
            avgSize,
            currentEpoch: this.previousEpoch?.name || 'Unknown'
        };
    }

    /**
     * Reset evolution state
     */
    reset() {
        this.galaxiesInitialized = false;
        this.previousEpoch = null;

        // Reset all visual properties to initial state
        const p = this.particles.particles;
        const n = this.particles.count;

        for (let i = 0; i < n; i++) {
            p.blur[i] = 1.0;
            p.jitter[i] = 1.0;
            p.baseSize[i] = 1.0;
        }
    }
}

export default ParticleEvolution;
