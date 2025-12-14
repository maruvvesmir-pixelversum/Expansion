/**
 * Temporal Physics System
 * Universe Evolution Simulator v3.0.0
 *
 * Updates particles at different frequencies based on importance
 * Critical for 1M particle performance - reduces physics updates by 80%+
 */

export class TemporalPhysics {
    constructor() {
        // Frame counter
        this.frameCount = 0;

        // Update frequency groups
        this.updateGroups = {
            critical: [],    // Update every frame
            high: [],        // Update every 2 frames
            medium: [],      // Update every 4 frames
            low: [],         // Update every 8 frames
            minimal: []      // Update every 16 frames
        };

        // Statistics
        this.stats = {
            totalParticles: 0,
            updatedThisFrame: 0,
            skipRatio: 0
        };
    }

    /**
     * Assign particles to update groups based on camera distance
     */
    assignUpdateGroups(particles, camera) {
        const p = particles.particles;
        const n = particles.count;

        // Clear groups
        this.updateGroups.critical = [];
        this.updateGroups.high = [];
        this.updateGroups.medium = [];
        this.updateGroups.low = [];
        this.updateGroups.minimal = [];

        for (let i = 0; i < n; i++) {
            if (!p.active[i]) continue;

            // Calculate distance to camera
            const dx = p.x[i] - camera.x;
            const dy = p.y[i] - camera.y;
            const dz = p.z[i] - camera.z;
            const distSq = dx * dx + dy * dy + dz * dz;

            // Assign to group based on distance
            if (distSq < 100) {
                this.updateGroups.critical.push(i);
            } else if (distSq < 500) {
                this.updateGroups.high.push(i);
            } else if (distSq < 2000) {
                this.updateGroups.medium.push(i);
            } else if (distSq < 10000) {
                this.updateGroups.low.push(i);
            } else {
                this.updateGroups.minimal.push(i);
            }
        }

        this.stats.totalParticles = n;
    }

    /**
     * Get list of particle indices to update this frame
     */
    getParticlesToUpdate() {
        const toUpdate = [];

        // Critical: always update
        toUpdate.push(...this.updateGroups.critical);

        // High: update every 2 frames
        if (this.frameCount % 2 === 0) {
            toUpdate.push(...this.updateGroups.high);
        }

        // Medium: update every 4 frames
        if (this.frameCount % 4 === 0) {
            toUpdate.push(...this.updateGroups.medium);
        }

        // Low: update every 8 frames
        if (this.frameCount % 8 === 0) {
            toUpdate.push(...this.updateGroups.low);
        }

        // Minimal: update every 16 frames
        if (this.frameCount % 16 === 0) {
            toUpdate.push(...this.updateGroups.minimal);
        }

        this.stats.updatedThisFrame = toUpdate.length;
        this.stats.skipRatio = 1 - (toUpdate.length / this.stats.totalParticles);

        this.frameCount++;
        return toUpdate;
    }

    /**
     * Should this particle be updated this frame?
     */
    shouldUpdate(particleIndex, zDepth) {
        // Simple distance-based check
        if (zDepth < 50) return true;  // Always update close particles
        if (zDepth < 150) return this.frameCount % 2 === 0;  // 50% update rate
        if (zDepth < 400) return this.frameCount % 4 === 0;  // 25% update rate
        if (zDepth < 800) return this.frameCount % 8 === 0;  // 12.5% update rate
        return this.frameCount % 16 === 0;  // 6.25% update rate for very distant
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            ...this.stats,
            groups: {
                critical: this.updateGroups.critical.length,
                high: this.updateGroups.high.length,
                medium: this.updateGroups.medium.length,
                low: this.updateGroups.low.length,
                minimal: this.updateGroups.minimal.length
            }
        };
    }
}

export default TemporalPhysics;
