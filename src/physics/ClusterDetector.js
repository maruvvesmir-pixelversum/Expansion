/**
 * Cluster Detection System
 * Universe Evolution Simulator v2.47.3
 *
 * Identifies dense regions of particles (galaxy clusters, filaments, voids)
 * Uses grid-based density estimation for O(N) performance
 */

export class ClusterDetector {
    constructor(config = {}) {
        // Grid resolution for density estimation
        this.gridSize = config.gridSize ?? 50;

        // Density thresholds (relative to mean density)
        this.thresholds = {
            void: 0.2,      // < 20% of mean = void
            filament: 1.5,  // > 150% of mean = filament
            cluster: 3.0,   // > 300% of mean = cluster
            supercluster: 5.0  // > 500% of mean = supercluster
        };

        // Grid data
        this.grid = null;
        this.cellSize = 0;
        this.gridOrigin = { x: 0, y: 0, z: 0 };

        // Detection results
        this.clusters = [];
        this.filaments = [];
        this.voids = [];

        // Statistics
        this.stats = {
            clusterCount: 0,
            filamentCount: 0,
            voidCount: 0,
            meanDensity: 0,
            maxDensity: 0,
            clusteringFactor: 0  // Ratio of max to mean density
        };
    }

    /**
     * Initialize grid for density estimation
     */
    initGrid(bounds) {
        const size = this.gridSize;
        const rangeX = bounds.max.x - bounds.min.x;
        const rangeY = bounds.max.y - bounds.min.y;
        const rangeZ = bounds.max.z - bounds.min.z;

        this.cellSize = Math.max(rangeX, rangeY, rangeZ) / size;
        this.gridOrigin = {
            x: bounds.min.x,
            y: bounds.min.y,
            z: bounds.min.z
        };

        // 3D density grid
        this.grid = new Float32Array(size * size * size);
        this.grid.fill(0);
    }

    /**
     * Get grid cell index for a position
     */
    getCellIndex(x, y, z) {
        const size = this.gridSize;
        const ix = Math.floor((x - this.gridOrigin.x) / this.cellSize);
        const iy = Math.floor((y - this.gridOrigin.y) / this.cellSize);
        const iz = Math.floor((z - this.gridOrigin.z) / this.cellSize);

        // Clamp to grid bounds
        const cx = Math.max(0, Math.min(size - 1, ix));
        const cy = Math.max(0, Math.min(size - 1, iy));
        const cz = Math.max(0, Math.min(size - 1, iz));

        return cx + cy * size + cz * size * size;
    }

    /**
     * Convert flat index back to 3D coordinates
     */
    indexToCoords(index) {
        const size = this.gridSize;
        const z = Math.floor(index / (size * size));
        const y = Math.floor((index % (size * size)) / size);
        const x = index % size;
        return { x, y, z };
    }

    /**
     * Get world position of a cell center
     */
    cellToWorld(cx, cy, cz) {
        return {
            x: this.gridOrigin.x + (cx + 0.5) * this.cellSize,
            y: this.gridOrigin.y + (cy + 0.5) * this.cellSize,
            z: this.gridOrigin.z + (cz + 0.5) * this.cellSize
        };
    }

    /**
     * Detect clusters in particle system
     */
    detect(particles) {
        const p = particles.particles;
        const n = particles.count;

        // Calculate bounds
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        for (let i = 0; i < n; i++) {
            minX = Math.min(minX, p.x[i]);
            maxX = Math.max(maxX, p.x[i]);
            minY = Math.min(minY, p.y[i]);
            maxY = Math.max(maxY, p.y[i]);
            minZ = Math.min(minZ, p.z[i]);
            maxZ = Math.max(maxZ, p.z[i]);
        }

        // Add padding
        const padding = (maxX - minX) * 0.1;
        const bounds = {
            min: { x: minX - padding, y: minY - padding, z: minZ - padding },
            max: { x: maxX + padding, y: maxY + padding, z: maxZ + padding }
        };

        // Initialize grid
        this.initGrid(bounds);

        // Accumulate density
        for (let i = 0; i < n; i++) {
            const idx = this.getCellIndex(p.x[i], p.y[i], p.z[i]);
            this.grid[idx] += p.mass[i];
        }

        // Calculate statistics
        let totalDensity = 0;
        let maxDensity = 0;
        let occupiedCells = 0;

        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i] > 0) {
                totalDensity += this.grid[i];
                maxDensity = Math.max(maxDensity, this.grid[i]);
                occupiedCells++;
            }
        }

        const meanDensity = occupiedCells > 0 ? totalDensity / occupiedCells : 0;

        this.stats.meanDensity = meanDensity;
        this.stats.maxDensity = maxDensity;
        this.stats.clusteringFactor = meanDensity > 0 ? maxDensity / meanDensity : 0;

        // Identify structures
        this.clusters = [];
        this.filaments = [];
        this.voids = [];

        const size = this.gridSize;

        for (let i = 0; i < this.grid.length; i++) {
            const density = this.grid[i];
            const relativeDensity = meanDensity > 0 ? density / meanDensity : 0;
            const coords = this.indexToCoords(i);
            const worldPos = this.cellToWorld(coords.x, coords.y, coords.z);

            if (relativeDensity >= this.thresholds.supercluster) {
                this.clusters.push({
                    type: 'supercluster',
                    position: worldPos,
                    density: density,
                    relativeDensity: relativeDensity,
                    size: this.cellSize
                });
            } else if (relativeDensity >= this.thresholds.cluster) {
                this.clusters.push({
                    type: 'cluster',
                    position: worldPos,
                    density: density,
                    relativeDensity: relativeDensity,
                    size: this.cellSize
                });
            } else if (relativeDensity >= this.thresholds.filament) {
                this.filaments.push({
                    position: worldPos,
                    density: density,
                    relativeDensity: relativeDensity
                });
            } else if (density > 0 && relativeDensity <= this.thresholds.void) {
                this.voids.push({
                    position: worldPos,
                    density: density,
                    relativeDensity: relativeDensity
                });
            }
        }

        // Merge nearby clusters
        this.mergeClusters();

        // Update statistics
        this.stats.clusterCount = this.clusters.length;
        this.stats.filamentCount = this.filaments.length;
        this.stats.voidCount = this.voids.length;

        return this.stats;
    }

    /**
     * Merge nearby clusters into larger structures
     */
    mergeClusters() {
        if (this.clusters.length < 2) return;

        const mergeDistance = this.cellSize * 2;
        const merged = [];
        const used = new Set();

        for (let i = 0; i < this.clusters.length; i++) {
            if (used.has(i)) continue;

            const cluster = { ...this.clusters[i] };
            let totalMass = cluster.density;
            let cx = cluster.position.x * cluster.density;
            let cy = cluster.position.y * cluster.density;
            let cz = cluster.position.z * cluster.density;
            let count = 1;

            for (let j = i + 1; j < this.clusters.length; j++) {
                if (used.has(j)) continue;

                const other = this.clusters[j];
                const dx = cluster.position.x - other.position.x;
                const dy = cluster.position.y - other.position.y;
                const dz = cluster.position.z - other.position.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < mergeDistance) {
                    used.add(j);
                    cx += other.position.x * other.density;
                    cy += other.position.y * other.density;
                    cz += other.position.z * other.density;
                    totalMass += other.density;
                    count++;
                }
            }

            // Calculate center of mass
            cluster.position = {
                x: cx / totalMass,
                y: cy / totalMass,
                z: cz / totalMass
            };
            cluster.density = totalMass;
            cluster.size = this.cellSize * Math.cbrt(count);

            merged.push(cluster);
        }

        this.clusters = merged;
    }

    /**
     * Get density at a specific position
     */
    getDensityAt(x, y, z) {
        if (!this.grid) return 0;
        const idx = this.getCellIndex(x, y, z);
        return this.grid[idx];
    }

    /**
     * Get relative density at a position (compared to mean)
     */
    getRelativeDensityAt(x, y, z) {
        if (!this.grid || this.stats.meanDensity === 0) return 0;
        return this.getDensityAt(x, y, z) / this.stats.meanDensity;
    }

    /**
     * Find the nearest cluster to a position
     */
    findNearestCluster(x, y, z) {
        if (this.clusters.length === 0) return null;

        let nearest = null;
        let minDist = Infinity;

        for (const cluster of this.clusters) {
            const dx = x - cluster.position.x;
            const dy = y - cluster.position.y;
            const dz = z - cluster.position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < minDist) {
                minDist = dist;
                nearest = { ...cluster, distance: dist };
            }
        }

        return nearest;
    }

    /**
     * Get clusters sorted by density
     */
    getTopClusters(count = 10) {
        return [...this.clusters]
            .sort((a, b) => b.density - a.density)
            .slice(0, count);
    }

    /**
     * Get statistics
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Get all detected structures
     */
    getStructures() {
        return {
            clusters: this.clusters,
            filaments: this.filaments,
            voids: this.voids
        };
    }
}

export default ClusterDetector;
