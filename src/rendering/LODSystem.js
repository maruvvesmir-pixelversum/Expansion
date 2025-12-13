/**
 * Level of Detail (LOD) System
 * Universe Evolution Simulator v2.47.3
 *
 * Manages particle rendering detail based on distance and density
 */

export class LODSystem {
    constructor(config = {}) {
        // LOD distance thresholds (in world units)
        this.levels = config.levels ?? [
            { distance: 0, renderRatio: 1.0, sizeMultiplier: 1.0, glowRadius: 8 },     // LOD 0: Close
            { distance: 100, renderRatio: 0.5, sizeMultiplier: 0.8, glowRadius: 4 },   // LOD 1: Medium
            { distance: 500, renderRatio: 0.2, sizeMultiplier: 0.5, glowRadius: 2 },   // LOD 2: Far
            { distance: 2000, renderRatio: 0.05, sizeMultiplier: 0.3, glowRadius: 1 }  // LOD 3: Very far
        ];

        // Adaptive quality settings
        this.targetFPS = config.targetFPS ?? 60;
        this.qualityLevel = 1.0;  // 0.3 to 1.0
        this.adaptiveEnabled = config.adaptiveEnabled ?? true;

        // Performance tracking
        this.fpsHistory = new Array(30).fill(60);
        this.avgFPS = 60;

        // LOD statistics
        this.stats = {
            lod0Count: 0,
            lod1Count: 0,
            lod2Count: 0,
            lod3Count: 0,
            totalRendered: 0,
            qualityLevel: 1.0
        };
    }

    /**
     * Update adaptive quality based on FPS
     */
    updateAdaptiveQuality(currentFPS) {
        if (!this.adaptiveEnabled) return;

        this.fpsHistory.push(currentFPS);
        this.fpsHistory.shift();

        // Calculate average FPS
        this.avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;

        // Adjust quality
        if (this.avgFPS < 45) {
            // Performance critical - reduce quality
            this.qualityLevel = Math.max(0.3, this.qualityLevel - 0.05);
        } else if (this.avgFPS > 58 && this.qualityLevel < 1.0) {
            // Headroom available - increase quality
            this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.02);
        }

        this.stats.qualityLevel = this.qualityLevel;
    }

    /**
     * Get LOD level for a particle based on z-depth
     */
    getLODLevel(zDepth) {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (zDepth >= this.levels[i].distance) {
                return i;
            }
        }
        return 0;
    }

    /**
     * Determine if a particle should be rendered based on LOD
     */
    shouldRender(index, zDepth) {
        const level = this.getLODLevel(zDepth);
        const ratio = this.levels[level].renderRatio * this.qualityLevel;

        // Use particle index for consistent culling
        // (avoids flickering as particles stay in/out of render set)
        const hash = (index * 2654435761) % 1000;
        return hash < ratio * 1000;
    }

    /**
     * Get rendering parameters for a particle
     */
    getRenderParams(zDepth) {
        const level = this.getLODLevel(zDepth);
        const params = this.levels[level];

        return {
            level,
            sizeMultiplier: params.sizeMultiplier * this.qualityLevel,
            glowRadius: params.glowRadius * this.qualityLevel,
            renderRatio: params.renderRatio * this.qualityLevel
        };
    }

    /**
     * Calculate render stride for particle system
     * Lower stride = more particles rendered
     */
    calculateStride(particleCount, targetVisible) {
        const adjustedTarget = targetVisible * this.qualityLevel;
        return Math.max(1, Math.floor(particleCount / adjustedTarget));
    }

    /**
     * Process particles and return LOD-filtered visible list
     */
    processParticles(particles, camera, maxVisible = 150000) {
        const p = particles.particles;
        const n = particles.count;

        // Reset statistics
        this.stats.lod0Count = 0;
        this.stats.lod1Count = 0;
        this.stats.lod2Count = 0;
        this.stats.lod3Count = 0;

        const visible = [];
        const stride = this.calculateStride(n, maxVisible);

        for (let i = 0; i < n; i += stride) {
            const projected = camera.project(p.x[i], p.y[i], p.z[i]);

            if (!projected.visible) continue;

            // Check LOD culling
            if (!this.shouldRender(i, projected.z)) continue;

            const lodParams = this.getRenderParams(projected.z);

            // Update statistics
            switch (lodParams.level) {
                case 0: this.stats.lod0Count++; break;
                case 1: this.stats.lod1Count++; break;
                case 2: this.stats.lod2Count++; break;
                case 3: this.stats.lod3Count++; break;
            }

            visible.push({
                index: i,
                x: projected.x,
                y: projected.y,
                z: projected.z,
                size: Math.max(0.3, (1.5 + p.size[i] * 0.5) *
                    projected.perspective * camera.zoom * lodParams.sizeMultiplier),
                r: p.colorR[i],
                g: p.colorG[i],
                b: p.colorB[i],
                alpha: Math.min(1, 0.4 + p.brightness[i] * 0.6),
                brightness: p.brightness[i],
                glowRadius: lodParams.glowRadius,
                lodLevel: lodParams.level,
                prevX: p.prevScreenX[i],
                prevY: p.prevScreenY[i]
            });

            // Update previous position
            p.prevScreenX[i] = projected.x;
            p.prevScreenY[i] = projected.y;
        }

        this.stats.totalRendered = visible.length;

        return visible;
    }

    /**
     * Get LOD statistics
     */
    getStats() {
        return {
            ...this.stats,
            avgFPS: this.avgFPS,
            qualityLevel: (this.qualityLevel * 100).toFixed(0) + '%'
        };
    }

    /**
     * Set quality level manually
     */
    setQualityLevel(level) {
        this.qualityLevel = Math.max(0.3, Math.min(1.0, level));
    }

    /**
     * Enable/disable adaptive quality
     */
    setAdaptiveEnabled(enabled) {
        this.adaptiveEnabled = enabled;
        if (!enabled) {
            this.qualityLevel = 1.0;
        }
    }
}

export default LODSystem;
