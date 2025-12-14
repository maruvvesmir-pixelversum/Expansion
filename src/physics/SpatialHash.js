/**
 * Spatial Hash Grid
 * Universe Evolution Simulator v3.0.0
 *
 * O(N) neighbor queries for gravity and collision detection
 * Critical for 1M particle performance
 */

export class SpatialHash {
    constructor(cellSize = 10.0) {
        this.cellSize = cellSize;
        this.grid = new Map();
        this.particleCount = 0;
    }

    /**
     * Get cell coordinates for a position
     */
    getCellKey(x, y, z) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        const cz = Math.floor(z / this.cellSize);
        return `${cx},${cy},${cz}`;
    }

    /**
     * Clear the grid
     */
    clear() {
        this.grid.clear();
        this.particleCount = 0;
    }

    /**
     * Insert all particles into spatial grid
     */
    buildGrid(particles) {
        this.clear();

        const p = particles.particles;
        const n = particles.count;

        for (let i = 0; i < n; i++) {
            if (!p.active[i]) continue;

            const key = this.getCellKey(p.x[i], p.y[i], p.z[i]);

            if (!this.grid.has(key)) {
                this.grid.set(key, []);
            }

            this.grid.get(key).push(i);
            this.particleCount++;
        }
    }

    /**
     * Get neighboring cell keys (27 cells in 3D grid)
     */
    getNeighborCells(x, y, z) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        const cz = Math.floor(z / this.cellSize);

        const cells = [];

        // Check 3x3x3 cube of cells around particle
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    cells.push(`${cx + dx},${cy + dy},${cz + dz}`);
                }
            }
        }

        return cells;
    }

    /**
     * Get neighbor particle indices within radius
     */
    getNeighbors(x, y, z, radius) {
        const neighbors = [];
        const radiusSq = radius * radius;
        const cells = this.getNeighborCells(x, y, z);

        for (const cellKey of cells) {
            const cell = this.grid.get(cellKey);
            if (!cell) continue;

            for (const idx of cell) {
                neighbors.push(idx);
            }
        }

        return neighbors;
    }

    /**
     * Query particles in radius (with distance check)
     */
    queryRadius(particles, x, y, z, radius) {
        const result = [];
        const radiusSq = radius * radius;
        const neighbors = this.getNeighbors(x, y, z, radius);
        const p = particles.particles;

        for (const idx of neighbors) {
            const dx = p.x[idx] - x;
            const dy = p.y[idx] - y;
            const dz = p.z[idx] - z;
            const distSq = dx * dx + dy * dy + dz * dz;

            if (distSq <= radiusSq) {
                result.push({ index: idx, distSq });
            }
        }

        return result;
    }

    /**
     * Find closest N neighbors
     */
    findNearestN(particles, x, y, z, n) {
        const neighbors = this.getNeighbors(x, y, z, this.cellSize * 3);
        const p = particles.particles;

        // Calculate distances
        const withDist = neighbors.map(idx => {
            const dx = p.x[idx] - x;
            const dy = p.y[idx] - y;
            const dz = p.z[idx] - z;
            return {
                index: idx,
                distSq: dx * dx + dy * dy + dz * dz
            };
        });

        // Sort by distance and take top N
        withDist.sort((a, b) => a.distSq - b.distSq);
        return withDist.slice(0, n);
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            cellCount: this.grid.size,
            particleCount: this.particleCount,
            avgPerCell: this.grid.size > 0 ? this.particleCount / this.grid.size : 0,
            cellSize: this.cellSize
        };
    }

    /**
     * Adaptive cell size based on particle distribution
     */
    optimizeCellSize(particles) {
        // Calculate average particle spacing
        const p = particles.particles;
        const n = Math.min(particles.count, 1000); // Sample

        let avgDist = 0;
        let samples = 0;

        for (let i = 0; i < n; i += 10) {
            if (!p.active[i]) continue;

            // Find nearest neighbor (simple check)
            let minDist = Infinity;
            for (let j = i + 1; j < Math.min(i + 100, n); j++) {
                if (!p.active[j]) continue;

                const dx = p.x[i] - p.x[j];
                const dy = p.y[i] - p.y[j];
                const dz = p.z[i] - p.z[j];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                minDist = Math.min(minDist, dist);
            }

            if (isFinite(minDist)) {
                avgDist += minDist;
                samples++;
            }
        }

        if (samples > 0) {
            avgDist /= samples;
            // Set cell size to 2-3x average particle spacing
            this.cellSize = Math.max(1.0, avgDist * 2.5);
        }
    }
}

export default SpatialHash;
