/**
 * Particle Renderer
 * Universe Evolution Simulator v2.47.3
 *
 * Canvas 2D-based particle rendering with effects
 */

import { VISUAL } from '../utils/constants.js';
import { LODSystem } from './LODSystem.js';
import { EpochRenderer } from './EpochRenderer.js';

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

        // Initialize epoch-specific renderer
        this.epochRenderer = new EpochRenderer();

        // Rendering settings
        this.particleSizeMultiplier = 6.0;  // Very large for visibility
        this.maxVisibleParticles = 20000;  // Show lots of particles
        this.renderStride = 1;

        // Visual effects
        this.effects = {
            bloom: true,
            bloomIntensity: 0.7,
            motionBlur: true,
            motionBlurLength: 0.3,
            filmGrain: true,
            grainIntensity: 0.1,
            vignette: true,
            vignetteIntensity: 0.3,
            cosmicWeb: false,
            cosmicWebDensity: 0,
            useLOD: false  // Disable LOD to show all particles
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
     * Main render function - ULTRA OPTIMIZED
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

        // PERFORMANCE: Enable hardware acceleration hints
        ctx.imageSmoothingEnabled = false;  // Disable for pixel-perfect rendering (faster)


        // Update LOD system with current FPS
        if (options.currentFPS && this.effects.useLOD) {
            this.lodSystem.updateAdaptiveQuality(options.currentFPS);
        }

        // Clear canvas with PITCH BLACK space (empty void)
        // Space around the universe is completely empty and dark
        // Only particles emit light against this darkness
        ctx.fillStyle = 'rgb(0, 0, 0)';  // Pure black - empty space
        ctx.fillRect(0, 0, width, height);

        // OPTIMIZATION: Cache depth gradient creation
        if (!this._depthGradient || this._lastWidth !== width || this._lastHeight !== height) {
            this._depthGradient = ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.max(width, height) * 0.8
            );
            this._depthGradient.addColorStop(0, 'rgba(5, 5, 10, 0.15)');
            this._depthGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            this._lastWidth = width;
            this._lastHeight = height;
        }
        ctx.fillStyle = this._depthGradient;
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


        // Draw grid if enabled
        if (options.showGrid) {
            this.drawGrid(ctx, camera);
        }

        // Draw cosmic web if enabled
        if (this.effects.cosmicWeb && this.visibleParticles.length > 100) {
            this.drawCosmicWeb(ctx);
        }

        // Render particles using epoch-specific renderer
        ctx.globalCompositeOperation = 'lighter';
        this.epochRenderer.render(ctx, this.visibleParticles, camera, epoch, {
            selectedGalaxy: options.selectedGalaxy,
            frameCount: options.frameCount || 0
        });
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
     * ULTRA OPTIMIZED: Collect visible particles with frustum culling and batching
     * Uses aggressive optimizations for 60 FPS with high particle counts
     */
    collectVisibleParticles(particles, camera) {
        this.visibleParticles.length = 0;  // Clear array without reallocating

        const p = particles.particles;
        const n = particles.count;
        const stride = this.calculateStride(n);

        // Pre-compute constants outside loop
        const minSizeDoubled = VISUAL.particleMinSize * 2;
        const zoom = camera.zoom;
        const sizeMultiplier = this.particleSizeMultiplier;
        const zoomTimesMultiplier = zoom * sizeMultiplier;

        // OPTIMIZATION: Frustum culling - calculate view bounds
        const canvasWidth = this.canvasMain.width;
        const canvasHeight = this.canvasMain.height;
        const margin = 100; // Render particles slightly offscreen for smooth transitions
        const viewLeft = -margin;
        const viewRight = canvasWidth + margin;
        const viewTop = -margin;
        const viewBottom = canvasHeight + margin;

        // OPTIMIZATION: Process particles in batches for better cache locality
        const batchSize = 1000;
        for (let batchStart = 0; batchStart < n; batchStart += batchSize * stride) {
            const batchEnd = Math.min(batchStart + batchSize * stride, n);

            for (let i = batchStart; i < batchEnd; i += stride) {
                // OPTIMIZATION: Skip inactive particles immediately
                if (!p.active[i]) continue;

                const projected = camera.project(p.x[i], p.y[i], p.z[i]);

                if (!projected.visible) continue;

                // OPTIMIZATION: Frustum culling - skip offscreen particles
                const screenX = projected.x;
                const screenY = projected.y;
                if (screenX < viewLeft || screenX > viewRight ||
                    screenY < viewTop || screenY > viewBottom) {
                    continue;
                }

                // ULTRA OPTIMIZED: Cache array lookups in local variables
                const particleSize = p.size[i];
                const brightness = p.brightness[i];
                const colorR = p.colorR[i];
                const colorG = p.colorG[i];
                const colorB = p.colorB[i];

                // Store previous screen position
                const prevX = p.prevScreenX[i];
                const prevY = p.prevScreenY[i];
                p.prevScreenX[i] = screenX;
                p.prevScreenY[i] = screenY;

                // ULTRA OPTIMIZED: Fast size calculation (avoid Math.pow and Math.sqrt)
                const baseSize = 2.5 + particleSize;
                const perspective = projected.perspective;
                // Approximate p^1.5 without sqrt: use p * p * (0.5 + 0.5*p) for speed
                const depthSizeScale = perspective * perspective * (0.5 + 0.5 * perspective);
                const finalSize = baseSize * depthSizeScale * zoomTimesMultiplier;
                const clampedSize = finalSize < minSizeDoubled ? minSizeDoubled : finalSize;

                // ULTRA OPTIMIZED: Fast depth factor calculation
                const depthFactor = projected.depthFactor || 1;
                const depthAlpha = 0.4 + depthFactor * 0.6;
                const brightnessAlpha = 0.6 + brightness * 0.4;
                const foggedAlpha = brightnessAlpha * depthAlpha;

                // ULTRA OPTIMIZED: Fast color depth calculations
                const depthR = 0.8 + depthFactor * 0.2;
                const depthG = 0.85 + depthFactor * 0.15;
                const depthB = 0.95 + depthFactor * 0.05;

                // OPTIMIZATION: Only add particles that are actually large enough to see
                if (clampedSize < 0.5) continue; // Skip sub-pixel particles

                // Push to array (object creation is unavoidable but optimized)
                this.visibleParticles.push({
                    index: i,
                    screenX: screenX,
                    screenY: screenY,
                    z: projected.z,
                    depth: projected.depth || 0,
                    prevX: prevX,
                    prevY: prevY,
                    size: clampedSize,
                    r: (colorR * depthR) | 0,  // Bitwise OR for fast floor
                    g: (colorG * depthG) | 0,
                    b: (colorB * depthB) | 0,
                    alpha: foggedAlpha > 1 ? 1 : foggedAlpha,
                    brightness: brightness,
                    blur: p.blur[i] || 0,
                    jitter: p.jitter[i] || 0,
                    name: p.galaxyName[i] || '',
                    depthFactor: depthFactor
                });
            }
        }

        this.visibleCount = this.visibleParticles.length;
    }

    /**
     * ULTRA FAST particle rendering - batched, minimal state changes
     * Optimized for GPU acceleration
     */
    renderParticles(ctx, jitter) {
        const particles = this.visibleParticles;
        const count = particles.length;

        // FASTEST: Single-pass rendering with minimal state changes
        const hasJitter = jitter > 0.01;
        const TWO_PI = 6.283185307179586; // 2*PI hardcoded

        // PERFORMANCE: Batch particles by size for fewer state changes
        // Sort into size buckets: tiny (<1px), small (1-3px), medium (3-10px), large (>10px)
        const tinyParticles = [];
        const normalParticles = [];

        for (let i = 0; i < count; i++) {
            const p = particles[i];
            if (p.size < 1) {
                tinyParticles.push(p);
            } else {
                normalParticles.push(p);
            }
        }

        // PERFORMANCE: Render tiny particles as single pixels (ultra fast)
        if (tinyParticles.length > 0) {
            for (let i = 0; i < tinyParticles.length; i++) {
                const p = tinyParticles[i];
                ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
                ctx.fillRect(p.screenX | 0, p.screenY | 0, 1, 1);
            }
        }

        // PERFORMANCE: Render normal particles with reduced state changes
        if (normalParticles.length > 0) {
            // Group by similar colors to reduce fillStyle changes
            let lastColorKey = '';

            for (let i = 0; i < normalParticles.length; i++) {
                const p = normalParticles[i];

                // PERFORMANCE: Apply jitter only if needed
                const x = hasJitter ? p.screenX + (Math.random() - 0.5) * jitter * 5 : p.screenX;
                const y = hasJitter ? p.screenY + (Math.random() - 0.5) * jitter * 5 : p.screenY;

                // PERFORMANCE: Only change fillStyle if color changed
                const colorKey = `${p.r},${p.g},${p.b},${p.alpha}`;
                if (colorKey !== lastColorKey) {
                    ctx.fillStyle = `rgba(${colorKey})`;
                    lastColorKey = colorKey;
                }

                // PERFORMANCE: Use path batching for circles
                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, TWO_PI);
                ctx.fill();
            }
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
