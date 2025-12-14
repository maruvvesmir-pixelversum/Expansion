/**
 * Epoch-Specific Renderer
 * Universe Evolution Simulator v3.0.0
 *
 * Handles different rendering styles for different cosmic epochs
 * - Singularity: Tiny dense point
 * - Energy: Pure energy glow
 * - Plasma: Large, blurry, overlapping particles (QGP)
 * - Particles: Standard rendering with some blur
 * - Galaxies: Sharp points with labels
 */

import { RENDER_MODES } from '../data/detailedEpochs.js';

export class EpochRenderer {
    constructor() {
        // Rendering options
        this.showLabels = false;
        this.labelMinZoom = 0.5; // Minimum zoom to show labels
        this.labelFontSize = 10;

        // Effect intensities
        this.glowIntensity = 1.0;
        this.bloomEnabled = false;

        // Cosmic web visualization
        this.showCosmicWeb = true;  // Show filaments and clusters
        this.cosmicWebMaxDistance = 15.0;  // Maximum distance for filament connections
        this.cosmicWebDensityThreshold = 3;  // Minimum neighbors for cluster
        this.filamentAlpha = 0.15;  // Transparency of filament lines

        // Debug logging
        this.lastRenderMode = null;
        this.renderModeLogged = false;
    }

    /**
     * Main render function - routes to appropriate renderer based on mode
     */
    render(ctx, visibleParticles, camera, epoch, options = {}) {
        const renderMode = epoch.renderMode || RENDER_MODES.PARTICLES;

        // Track render mode
        if (renderMode !== this.lastRenderMode) {
            this.lastRenderMode = renderMode;
        }

        switch (renderMode) {
            case RENDER_MODES.SINGULARITY:
                this.renderSingularity(ctx, visibleParticles, epoch, options);
                break;

            case RENDER_MODES.ENERGY:
                this.renderEnergyField(ctx, visibleParticles, epoch, options);
                break;

            case RENDER_MODES.PLASMA:
                this.renderPlasma(ctx, visibleParticles, epoch, options);
                break;

            case RENDER_MODES.GALAXIES:
                this.renderGalaxies(ctx, visibleParticles, camera, epoch, options);
                break;

            case RENDER_MODES.PARTICLES:
            default:
                this.renderStandardParticles(ctx, visibleParticles, epoch, options);
                break;
        }
    }

    /**
     * Render singularity (Planck epoch)
     * FAST: Simple circles - white core with yellow and red outlines
     * NO GRADIENTS for performance!
     */
    renderSingularity(ctx, visibleParticles, epoch, options) {
        if (visibleParticles.length === 0) return;

        // Render each particle as simple concentric circles
        visibleParticles.forEach(p => {
            const x = p.screenX ?? p.x;
            const y = p.screenY ?? p.y;
            if (!isFinite(x) || !isFinite(y)) return;

            const size = p.size * 1.5; // Slightly larger for early universe

            // Outer red ring (thinnest)
            ctx.fillStyle = 'rgb(255, 60, 20)';
            ctx.beginPath();
            ctx.arc(x, y, size * 1.4, 0, 6.283185307179586);
            ctx.fill();

            // Middle yellow ring (thin)
            ctx.fillStyle = 'rgb(255, 255, 100)';
            ctx.beginPath();
            ctx.arc(x, y, size * 1.2, 0, 6.283185307179586);
            ctx.fill();

            // Inner white core (brightest)
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 6.283185307179586);
            ctx.fill();
        });
    }

    /**
     * Render energy field (early universe)
     * FAST: Simple circles - NO GLOW for performance!
     */
    renderEnergyField(ctx, visibleParticles, epoch, options) {
        visibleParticles.forEach(particle => {
            const x = particle.screenX ?? particle.x;
            const y = particle.screenY ?? particle.y;

            if (!isFinite(x) || !isFinite(y)) return;

            const size = particle.size * 1.2;

            // Simple solid circle - no gradients!
            ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 6.283185307179586);
            ctx.fill();
        });
    }

    /**
     * Render quark-gluon plasma
     * FAST: Simple concentric circles - NO GLOW for performance!
     */
    renderPlasma(ctx, visibleParticles, epoch, options) {
        // Single pass - draw each particle as white/yellow/red rings
        visibleParticles.forEach(particle => {
            const x = particle.screenX ?? particle.x;
            const y = particle.screenY ?? particle.y;
            if (!isFinite(x) || !isFinite(y)) return;

            const size = particle.size * 1.2;

            // Outer red ring (thinnest)
            ctx.fillStyle = 'rgb(255, 60, 20)';
            ctx.beginPath();
            ctx.arc(x, y, size * 1.3, 0, 6.283185307179586);
            ctx.fill();

            // Middle yellow ring (thin)
            ctx.fillStyle = 'rgb(255, 240, 100)';
            ctx.beginPath();
            ctx.arc(x, y, size * 1.15, 0, 6.283185307179586);
            ctx.fill();

            // Inner white core
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 6.283185307179586);
            ctx.fill();
        });
    }

    /**
     * Render standard particles (intermediate epochs)
     * Regular particles with moderate blur
     */
    renderStandardParticles(ctx, visibleParticles, epoch, options) {
        visibleParticles.forEach(particle => {
            // Safety checks for coordinates
            const x = particle.screenX ?? particle.x;
            const y = particle.screenY ?? particle.y;

            if (!isFinite(x) || !isFinite(y)) {
                return; // Skip particles with invalid coordinates
            }

            const size = particle.size;
            const blur = particle.blur ?? 0.3;

            if (blur > 0.1) {
                // Render with blur halo
                const blurRadius = size * (1 + blur);

                if (!isFinite(blurRadius) || blurRadius <= 0) {
                    return; // Skip if blur radius is invalid
                }

                const gradient = ctx.createRadialGradient(
                    x, y, 0,
                    x, y, blurRadius
                );

                const alpha = particle.alpha || 0.8;
                gradient.addColorStop(0, `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${alpha})`);
                gradient.addColorStop(0.7, `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${alpha * 0.4})`);
                gradient.addColorStop(1, `rgba(${particle.r}, ${particle.g}, ${particle.b}, 0)`);

                ctx.fillStyle = gradient;
                ctx.fillRect(
                    x - blurRadius,
                    y - blurRadius,
                    blurRadius * 2,
                    blurRadius * 2
                );
            } else {
                // Sharp particle
                ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.alpha || 1.0})`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    /**
     * Render galaxies (sharp points with optional labels)
     * Final galaxy epoch - crisp, detailed rendering
     * Includes cosmic web (filaments, clusters, voids)
     */
    renderGalaxies(ctx, visibleParticles, camera, epoch, options) {
        const selectedGalaxy = options.selectedGalaxy;
        const zoom = camera.zoom || 1.0;

        // Render cosmic web first (filaments and structure)
        if (this.showCosmicWeb && epoch.id === 'cosmic_web' || epoch.id === 'galaxy_clusters' || epoch.id === 'superclusters') {
            this.renderCosmicWeb(ctx, visibleParticles);
        }

        // Render normal galaxies
        visibleParticles.forEach(particle => {
            const x = particle.screenX ?? particle.x;
            const y = particle.screenY ?? particle.y;

            if (!isFinite(x) || !isFinite(y)) return;

            const size = particle.size * 0.8; // Slightly smaller for sharpness
            const isSelected = selectedGalaxy === particle.index;

            // Sharp galaxy core
            ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.alpha || 1.0})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();

            // Small glow for brightness
            if (particle.brightness > 0.5) {
                const glowSize = size * 1.5;
                const gradient = ctx.createRadialGradient(
                    x, y, size,
                    x, y, glowSize
                );
                gradient.addColorStop(0, `rgba(${particle.r}, ${particle.g}, ${particle.b}, 0.3)`);
                gradient.addColorStop(1, `rgba(${particle.r}, ${particle.g}, ${particle.b}, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, glowSize, 0, Math.PI * 2);
                ctx.fill();
            }

            // Highlight selected galaxy
            if (isSelected) {
                ctx.strokeStyle = 'rgba(255, 255, 100, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, size + 4, 0, Math.PI * 2);
                ctx.stroke();

                // Selection ring animation
                ctx.strokeStyle = 'rgba(255, 255, 100, 0.4)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, y, size + 8, 0, Math.PI * 2);
                ctx.stroke();
            }
        });

        // Render labels if zoomed in enough
        if (this.showLabels && zoom > this.labelMinZoom) {
            this.renderGalaxyLabels(ctx, visibleParticles, camera);
        }
    }

    /**
     * Render cosmic web structure (filaments connecting galaxies)
     * Shows the large-scale structure: clusters → filaments → voids
     */
    renderCosmicWeb(ctx, visibleParticles) {
        if (visibleParticles.length < 2) return;

        // Build neighbor graph for filament detection
        const neighbors = new Map();
        const maxDist = this.cosmicWebMaxDistance;

        // Find neighbors for each galaxy
        for (let i = 0; i < visibleParticles.length; i++) {
            const p1 = visibleParticles[i];
            const x1 = p1.screenX ?? p1.x;
            const y1 = p1.screenY ?? p1.y;

            if (!isFinite(x1) || !isFinite(y1)) continue;

            const nearbyGalaxies = [];

            for (let j = i + 1; j < visibleParticles.length; j++) {
                const p2 = visibleParticles[j];
                const x2 = p2.screenX ?? p2.x;
                const y2 = p2.screenY ?? p2.y;

                if (!isFinite(x2) || !isFinite(y2)) continue;

                // Calculate screen distance
                const dx = x2 - x1;
                const dy = y2 - y1;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Connect if within range
                if (dist < maxDist) {
                    nearbyGalaxies.push({ particle: p2, distance: dist, x: x2, y: y2 });
                }
            }

            neighbors.set(i, nearbyGalaxies);
        }

        // Render filaments (thin lines connecting nearby galaxies)
        ctx.globalAlpha = this.filamentAlpha;
        ctx.lineWidth = 1;

        for (let i = 0; i < visibleParticles.length; i++) {
            const p1 = visibleParticles[i];
            const x1 = p1.screenX ?? p1.x;
            const y1 = p1.screenY ?? p1.y;

            if (!isFinite(x1) || !isFinite(y1)) continue;

            const nearbyGalaxies = neighbors.get(i) || [];

            // Render filaments to nearby galaxies
            nearbyGalaxies.forEach(({ particle, distance, x, y }) => {
                // Filament strength based on distance (closer = stronger)
                const strength = 1.0 - (distance / maxDist);
                const alpha = this.filamentAlpha * strength;

                // Color based on density (more neighbors = redder, fewer = bluer)
                const neighborCount = nearbyGalaxies.length;
                const densityFactor = Math.min(neighborCount / this.cosmicWebDensityThreshold, 1.0);

                const r = 100 + densityFactor * 155;  // Red increases with density
                const g = 100 + (1 - densityFactor) * 100;
                const b = 200 - densityFactor * 100;  // Blue decreases with density

                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x, y);
                ctx.stroke();
            });
        }

        ctx.globalAlpha = 1.0;

        // Highlight high-density regions (clusters)
        for (let i = 0; i < visibleParticles.length; i++) {
            const p1 = visibleParticles[i];
            const x1 = p1.screenX ?? p1.x;
            const y1 = p1.screenY ?? p1.y;

            if (!isFinite(x1) || !isFinite(y1)) continue;

            const nearbyGalaxies = neighbors.get(i) || [];

            // If this galaxy is in a dense region (cluster), add subtle glow
            if (nearbyGalaxies.length >= this.cosmicWebDensityThreshold) {
                const clusterSize = 8 + nearbyGalaxies.length * 2;
                const gradient = ctx.createRadialGradient(
                    x1, y1, 0,
                    x1, y1, clusterSize
                );

                gradient.addColorStop(0, 'rgba(255, 150, 100, 0.2)');
                gradient.addColorStop(0.5, 'rgba(255, 120, 80, 0.1)');
                gradient.addColorStop(1, 'rgba(255, 100, 60, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x1, y1, clusterSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    /**
     * Render galaxy name labels
     * Only shown when zoomed in
     */
    renderGalaxyLabels(ctx, visibleParticles, camera) {
        ctx.font = `${this.labelFontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        visibleParticles.forEach(particle => {
            if (!particle.name) return;

            const x = particle.screenX ?? particle.x;
            const y = particle.screenY ?? particle.y;

            if (!isFinite(x) || !isFinite(y)) return;

            const labelY = y + particle.size + 4;

            // Label background
            const textWidth = ctx.measureText(particle.name).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(
                x - textWidth / 2 - 2,
                labelY - 1,
                textWidth + 4,
                this.labelFontSize + 2
            );

            // Label text
            ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, 0.9)`;
            ctx.fillText(particle.name, x, labelY);
        });
    }

    /**
     * Render particle with motion blur trail
     */
    renderWithMotionBlur(ctx, particle, prevX, prevY) {
        const dx = particle.screenX - prevX;
        const dy = particle.screenY - prevY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 2) {
            // No significant motion, render normally
            return false;
        }

        // Draw blur trail
        const steps = Math.min(Math.floor(distance / 2), 10);
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const x = prevX + dx * t;
            const y = prevY + dy * t;
            const alpha = (particle.alpha || 1.0) * (1 - t) * 0.5;
            const size = particle.size * (1 - t * 0.3);

            ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        return true;
    }

    /**
     * Toggle label visibility
     */
    toggleLabels() {
        this.showLabels = !this.showLabels;
        return this.showLabels;
    }

    /**
     * Set label options
     */
    setLabelOptions(options) {
        if (options.minZoom !== undefined) this.labelMinZoom = options.minZoom;
        if (options.fontSize !== undefined) this.labelFontSize = options.fontSize;
        if (options.show !== undefined) this.showLabels = options.show;
    }

    /**
     * Get rendering statistics
     */
    getStats() {
        return {
            showLabels: this.showLabels,
            labelMinZoom: this.labelMinZoom,
            glowIntensity: this.glowIntensity
        };
    }
}

export default EpochRenderer;
