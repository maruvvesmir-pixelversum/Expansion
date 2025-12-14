/**
 * Particle Renderer
 * Universe Evolution Simulator v2.47.3
 *
 * Canvas 2D-based particle rendering with effects
 */

import { VISUAL } from '../utils/constants.js';
import { LODSystem } from './LODSystem.js';

export class Renderer {
    constructor(canvasMain, canvasEffects) {
        this.canvasMain = canvasMain;
        this.canvasEffects = canvasEffects;

        this.ctxMain = canvasMain.getContext('2d', { alpha: false });
        this.ctxEffects = canvasEffects.getContext('2d', { willReadFrequently: true });

        // Initialize LOD system
        this.lodSystem = new LODSystem({
            targetFPS: 60,
            adaptiveEnabled: true
        });

        // Rendering settings - Optimized for early universe (small) → late universe (large)
        this.particleSizeMultiplier = 2.5;  // Smaller for better performance
        this.maxVisibleParticles = 2000;  // Aggressive limit for smooth FPS
        this.renderStride = 1;

        // Visual effects - Minimal for performance
        this.effects = {
            bloom: false,  // Disable for better performance
            bloomIntensity: 0,
            motionBlur: false,
            motionBlurLength: 0,
            filmGrain: false,
            grainIntensity: 0,
            vignette: false,
            vignetteIntensity: 0,
            cosmicWeb: true,  // Enable to see structure formation!
            cosmicWebDensity: 0.1,
            useLOD: true  // Critical for performance
        };

        // Render statistics
        this.visibleCount = 0;
        this.renderTime = 0;
        this.effectsTime = 0;

        // Visible particles buffer for sorting
        this.visibleParticles = [];
    }

    /**
     * Resize canvases
     */
    resize(width, height) {
        this.canvasMain.width = width;
        this.canvasMain.height = height;
        this.canvasEffects.width = width;
        this.canvasEffects.height = height;
    }

    /**
     * Calculate render stride based on particle count for performance
     */
    calculateStride(particleCount) {
        return Math.max(1, Math.floor(particleCount / this.maxVisibleParticles));
    }

    /**
     * Main render function
     */
    render(particles, camera, epoch, options = {}) {
        const renderStart = performance.now();

        const ctx = this.ctxMain;
        const width = this.canvasMain.width;
        const height = this.canvasMain.height;

        // Debug: Check if canvas is properly initialized
        if (!ctx) {
            console.error('Renderer: No 2D context available');
            return 0;
        }
        if (width === 0 || height === 0) {
            console.warn('Renderer: Canvas has zero size', { width, height });
            return 0;
        }

        // Debug first render
        if (!this._firstRenderLogged) {
            console.log('[RENDER] First render call:', {
                particleCount: particles.count,
                canvasSize: { width, height },
                cameraPos: { x: camera.x, y: camera.y, z: camera.z, zoom: camera.zoom },
                firstParticle: {
                    x: particles.particles.x[0],
                    y: particles.particles.y[0],
                    z: particles.particles.z[0]
                }
            });
            this._firstRenderLogged = true;
        }

        // Update LOD system with current FPS
        if (options.currentFPS && this.effects.useLOD) {
            this.lodSystem.updateAdaptiveQuality(options.currentFPS);
        }

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Get epoch effects
        const blur = epoch?.particleBlur ?? 0;
        const jitter = epoch?.particleJitter ?? 0;

        // Update camera viewport
        camera.setViewport(width, height);
        camera.updateRotation();

        // Collect visible particles (use LOD system if enabled)
        if (this.effects.useLOD) {
            this.visibleParticles = this.lodSystem.processParticles(
                particles, camera, this.maxVisibleParticles
            );
        } else {
            this.collectVisibleParticles(particles, camera);
        }

        // Sort by depth (back to front)
        this.visibleParticles.sort((a, b) => b.z - a.z);

        // Debug visibility
        if (!this._visibilityLogged && this.visibleParticles.length === 0) {
            console.warn('[RENDER] No visible particles!', {
                totalParticles: particles.count,
                useLOD: this.effects.useLOD,
                maxVisible: this.maxVisibleParticles,
                cameraPos: { x: camera.x, y: camera.y, z: camera.z, zoom: camera.zoom }
            });
            this._visibilityLogged = true;
        } else if (!this._visibilityLogged && this.visibleParticles.length > 0) {
            console.log('[RENDER] Visible particles:', this.visibleParticles.length, '/', particles.count);
            console.log('[RENDER] First visible particle:', this.visibleParticles[0]);
            this._visibilityLogged = true;
        }

        // Draw grid if enabled
        if (options.showGrid) {
            this.drawGrid(ctx, camera);
        }

        // Draw cosmic web if enabled
        if (this.effects.cosmicWeb && this.visibleParticles.length > 100) {
            this.drawCosmicWeb(ctx);
        }

        // Render particles
        ctx.globalCompositeOperation = 'lighter';
        this.renderParticles(ctx, jitter);
        ctx.globalCompositeOperation = 'source-over';


        // Draw velocity vectors if enabled
        if (options.showVelocities) {
            this.drawVelocities(ctx, particles, camera);
        }

        // Draw tracers if any
        if (options.tracers && options.tracers.length > 0) {
            this.drawTracers(ctx, options.tracers, particles, camera);
        }

        // Draw cluster markers if provided
        if (options.clusters && options.clusters.length > 0) {
            this.drawClusterMarkers(ctx, options.clusters, camera);
        }

        this.renderTime = performance.now() - renderStart;

        return this.visibleCount;
    }

    /**
     * Collect visible particles and project to screen space
     */
    collectVisibleParticles(particles, camera) {
        this.visibleParticles = [];

        const p = particles.particles;
        const n = particles.count;
        const stride = this.calculateStride(n);

        let checkedCount = 0;
        let culledCount = 0;

        for (let i = 0; i < n; i += stride) {
            checkedCount++;
            const projected = camera.project(p.x[i], p.y[i], p.z[i]);

            if (!projected.visible) {
                culledCount++;
                continue;
            }

            // Store previous screen position
            const prevX = p.prevScreenX[i];
            const prevY = p.prevScreenY[i];
            p.prevScreenX[i] = projected.x;
            p.prevScreenY[i] = projected.y;

            this.visibleParticles.push({
                index: i,
                x: projected.x,
                y: projected.y,
                z: projected.z,
                prevX: prevX,
                prevY: prevY,
                size: Math.max(VISUAL.particleMinSize,
                    (1.5 + p.size[i] * 0.5) * projected.perspective * camera.zoom * this.particleSizeMultiplier),
                r: p.colorR[i],
                g: p.colorG[i],
                b: p.colorB[i],
                alpha: Math.min(1, 0.4 + p.brightness[i] * 0.6),
                brightness: p.brightness[i]
            });
        }

        this.visibleCount = this.visibleParticles.length;
    }

    /**
     * Render all visible particles
     */
    renderParticles(ctx, jitter) {
        for (const particle of this.visibleParticles) {
            // Apply jitter
            const jx = particle.x + (Math.random() - 0.5) * jitter * 5;
            const jy = particle.y + (Math.random() - 0.5) * jitter * 5;

            // Draw motion blur trail
            if (this.effects.motionBlur && particle.prevX !== 0) {
                this.drawMotionBlur(ctx, particle, jx, jy);
            }

            // Draw bloom/glow
            if (this.effects.bloom && particle.size > 0.5) {
                this.drawBloom(ctx, particle, jx, jy);
            }

            // Draw particle core
            ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.alpha})`;
            ctx.beginPath();
            ctx.arc(jx, jy, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Draw motion blur trail
     */
    drawMotionBlur(ctx, particle, jx, jy) {
        const dx = jx - particle.prevX;
        const dy = jy - particle.prevY;
        const trailLength = Math.sqrt(dx * dx + dy * dy);

        if (trailLength > 1 && trailLength < this.effects.motionBlurLength) {
            const gradient = ctx.createLinearGradient(
                particle.prevX, particle.prevY, jx, jy
            );
            gradient.addColorStop(0, `rgba(${particle.r}, ${particle.g}, ${particle.b}, 0)`);
            gradient.addColorStop(1, `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.alpha * 0.3})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = particle.size * 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.prevX, particle.prevY);
            ctx.lineTo(jx, jy);
            ctx.stroke();
        }
    }

    /**
     * Draw bloom/glow effect
     */
    drawBloom(ctx, particle, x, y) {
        // Use LOD-specific glow radius if available
        const lodGlow = particle.glowRadius ?? 8;
        const glowSize = particle.size * (1 + lodGlow * this.effects.bloomIntensity * 0.5);
        const intensity = this.effects.bloomIntensity;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        gradient.addColorStop(0, `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.alpha * 0.4 * intensity})`);
        gradient.addColorStop(0.5, `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.alpha * 0.15 * intensity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw cosmic web connections
     */
    drawCosmicWeb(ctx) {
        const particles = this.visibleParticles;
        const maxConnections = Math.min(particles.length, 500);
        const connectionDistance = 50;

        ctx.strokeStyle = `rgba(60, 60, 80, ${this.effects.cosmicWebDensity})`;
        ctx.lineWidth = 0.5;

        for (let i = 0; i < maxConnections; i += 5) {
            const p1 = particles[i];

            for (let j = i + 1; j < Math.min(i + 20, particles.length); j++) {
                const p2 = particles[j];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance && dist > 5) {
                    const alpha = (1 - dist / connectionDistance) * 0.2;
                    ctx.strokeStyle = `rgba(80, 80, 100, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    }

    /**
     * Draw coordinate grid
     */
    drawGrid(ctx, camera) {
        const centerX = camera.centerX + camera.x;
        const centerY = camera.centerY + camera.y;
        const zoom = camera.zoom;

        ctx.strokeStyle = '#181818';
        ctx.lineWidth = 1;

        const gridSpacing = 20 * zoom;
        const gridCount = 20;

        for (let i = -gridCount; i <= gridCount; i++) {
            ctx.beginPath();
            ctx.moveTo(centerX - gridCount * gridSpacing, centerY + i * gridSpacing);
            ctx.lineTo(centerX + gridCount * gridSpacing, centerY + i * gridSpacing);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(centerX + i * gridSpacing, centerY - gridCount * gridSpacing);
            ctx.lineTo(centerX + i * gridSpacing, centerY + gridCount * gridSpacing);
            ctx.stroke();
        }
    }

    /**
     * Draw velocity vectors
     */
    drawVelocities(ctx, particles, camera) {
        const p = particles.particles;
        const n = particles.count;

        ctx.strokeStyle = 'rgba(100, 100, 120, 0.3)';
        ctx.lineWidth = 1;

        for (let i = 0; i < n; i += 2000) {
            const projected = camera.project(p.x[i], p.y[i], p.z[i]);
            if (!projected.visible) continue;

            const vScale = 100;
            const vx = p.vx[i] * vScale;
            const vy = p.vy[i] * vScale;
            const vz = p.vz[i] * vScale;

            // Project velocity endpoint
            const endProjected = camera.project(
                p.x[i] + vx,
                p.y[i] + vy,
                p.z[i] + vz
            );

            ctx.beginPath();
            ctx.moveTo(projected.x, projected.y);
            ctx.lineTo(endProjected.x, endProjected.y);
            ctx.stroke();
        }
    }

    /**
     * Draw particle tracers
     */
    drawTracers(ctx, tracers, particles, camera) {
        const p = particles.particles;

        for (const tracer of tracers) {
            const i = tracer.particleIndex;

            const projected = camera.project(p.x[i], p.y[i], p.z[i]);
            if (!projected.visible) continue;

            // Draw marker circle
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, 10, 0, Math.PI * 2);
            ctx.stroke();

            // Draw crosshairs
            ctx.beginPath();
            ctx.moveTo(projected.x - 15, projected.y);
            ctx.lineTo(projected.x - 5, projected.y);
            ctx.moveTo(projected.x + 5, projected.y);
            ctx.lineTo(projected.x + 15, projected.y);
            ctx.moveTo(projected.x, projected.y - 15);
            ctx.lineTo(projected.x, projected.y - 5);
            ctx.moveTo(projected.x, projected.y + 5);
            ctx.lineTo(projected.x, projected.y + 15);
            ctx.stroke();

            // Add to trail
            tracer.trail.push({ x: projected.x, y: projected.y });
            if (tracer.trail.length > 100) tracer.trail.shift();

            // Draw trail
            if (tracer.trail.length > 1) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.moveTo(tracer.trail[0].x, tracer.trail[0].y);
                for (let j = 1; j < tracer.trail.length; j++) {
                    ctx.lineTo(tracer.trail[j].x, tracer.trail[j].y);
                }
                ctx.stroke();
            }
        }
    }

    /**
     * Draw cluster markers
     */
    drawClusterMarkers(ctx, clusters, camera) {
        for (const cluster of clusters) {
            const pos = cluster.position;
            const projected = camera.project(pos.x, pos.y, pos.z);

            if (!projected.visible) continue;

            const size = Math.max(5, cluster.size * projected.perspective * camera.zoom * 0.5);

            // Color based on cluster type
            let color;
            let glowColor;
            if (cluster.type === 'supercluster') {
                color = 'rgba(255, 200, 100, 0.8)';
                glowColor = 'rgba(255, 180, 80, 0.3)';
            } else {
                color = 'rgba(150, 200, 255, 0.6)';
                glowColor = 'rgba(100, 150, 255, 0.2)';
            }

            // Draw glow
            const gradient = ctx.createRadialGradient(
                projected.x, projected.y, 0,
                projected.x, projected.y, size * 3
            );
            gradient.addColorStop(0, glowColor);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, size * 3, 0, Math.PI * 2);
            ctx.fill();

            // Draw marker circle
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw corner brackets
            const bracketSize = size * 0.4;
            ctx.beginPath();
            // Top-left
            ctx.moveTo(projected.x - size, projected.y - size + bracketSize);
            ctx.lineTo(projected.x - size, projected.y - size);
            ctx.lineTo(projected.x - size + bracketSize, projected.y - size);
            // Top-right
            ctx.moveTo(projected.x + size - bracketSize, projected.y - size);
            ctx.lineTo(projected.x + size, projected.y - size);
            ctx.lineTo(projected.x + size, projected.y - size + bracketSize);
            // Bottom-right
            ctx.moveTo(projected.x + size, projected.y + size - bracketSize);
            ctx.lineTo(projected.x + size, projected.y + size);
            ctx.lineTo(projected.x + size - bracketSize, projected.y + size);
            // Bottom-left
            ctx.moveTo(projected.x - size + bracketSize, projected.y + size);
            ctx.lineTo(projected.x - size, projected.y + size);
            ctx.lineTo(projected.x - size, projected.y + size - bracketSize);
            ctx.stroke();
        }
    }

    /**
     * Render post-processing effects
     */
    renderEffects() {
        const effectsStart = performance.now();

        const ctx = this.ctxEffects;
        const width = this.canvasEffects.width;
        const height = this.canvasEffects.height;

        ctx.clearRect(0, 0, width, height);

        // Vignette
        if (this.effects.vignette) {
            const gradient = ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.max(width, height) * 0.7
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, `rgba(0, 0, 0, ${this.effects.vignetteIntensity})`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        // Film grain (optimized)
        if (this.effects.filmGrain) {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            const intensity = this.effects.grainIntensity * 50;

            // Sample every 4th pixel for performance
            for (let i = 0; i < data.length; i += 16) {
                const noise = (Math.random() - 0.5) * intensity;
                data[i] = Math.min(255, Math.max(0, data[i] + noise));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
            }

            ctx.putImageData(imageData, 0, 0);
        }

        this.effectsTime = performance.now() - effectsStart;
    }

    /**
     * Set effect parameters
     */
    setEffects(effects) {
        Object.assign(this.effects, effects);
    }

    /**
     * Get render statistics
     */
    getStats() {
        const lodStats = this.effects.useLOD ? this.lodSystem.getStats() : {};
        return {
            visibleParticles: this.visibleCount,
            renderTime: this.renderTime,
            effectsTime: this.effectsTime,
            stride: this.renderStride,
            ...lodStats
        };
    }

    /**
     * Set LOD quality level manually
     */
    setLODQuality(level) {
        this.lodSystem.setQualityLevel(level);
    }

    /**
     * Enable/disable adaptive LOD
     */
    setAdaptiveLOD(enabled) {
        this.lodSystem.setAdaptiveEnabled(enabled);
    }
}

export default Renderer;
