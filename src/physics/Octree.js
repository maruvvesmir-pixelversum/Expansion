/**
 * Barnes-Hut Octree for O(N log N) Gravity Calculation
 * Universe Evolution Simulator v2.47.3
 *
 * Hierarchical spatial data structure for efficient N-body gravity
 */

import { Vec3, AABB } from '../utils/math.js';

/**
 * Octree Node
 */
class OctreeNode {
    constructor(bounds) {
        this.bounds = bounds;
        this.children = null;           // Array of 8 children if subdivided
        this.particles = [];             // Particle indices (leaf nodes only)
        this.totalMass = 0;              // Total mass in this node
        this.centerOfMass = new Vec3();  // Center of mass
        this.size = bounds.maxSize();    // Size for opening angle calculation
        this.isLeaf = true;
    }

    /**
     * Reset node for reuse
     */
    reset() {
        this.children = null;
        this.particles = [];
        this.totalMass = 0;
        this.centerOfMass.set(0, 0, 0);
        this.isLeaf = true;
    }
}

/**
 * Barnes-Hut Octree
 */
export class Octree {
    constructor(config = {}) {
        this.theta = config.theta ?? 0.5;        // Opening angle
        this.maxDepth = config.maxDepth ?? 20;   // Maximum tree depth
        this.maxParticlesPerNode = config.maxParticlesPerNode ?? 16;  // Increased from 8 for better performance

        this.root = null;
        this.nodePool = [];
        this.poolIndex = 0;

        // Statistics
        this.nodeCount = 0;
        this.maxDepthReached = 0;
        this.buildTime = 0;

        // PERFORMANCE: Cache for frequently accessed data
        this.thetaSquared = this.theta * this.theta;  // Pre-compute theta^2
    }

    /**
     * Get a node from the pool or create a new one
     */
    getNode(bounds) {
        if (this.poolIndex < this.nodePool.length) {
            const node = this.nodePool[this.poolIndex++];
            node.bounds = bounds;
            node.reset();
            return node;
        }
        const node = new OctreeNode(bounds);
        this.nodePool.push(node);
        this.poolIndex++;
        return node;
    }

    /**
     * Build the octree from particle data
     * @param {Object} particles - Particle system data (SoA)
     * @param {number} count - Number of particles
     */
    build(particles, count) {
        const startTime = performance.now();

        // Reset pool
        this.poolIndex = 0;
        this.nodeCount = 0;
        this.maxDepthReached = 0;

        if (count === 0) {
            this.root = null;
            return;
        }

        // Calculate bounding box
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (let i = 0; i < count; i++) {
            const x = particles.x[i];
            const y = particles.y[i];
            const z = particles.z[i];

            // Skip particles with invalid positions
            if (!isFinite(x) || !isFinite(y) || !isFinite(z)) {
                continue;
            }

            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (z < minZ) minZ = z;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z > maxZ) maxZ = z;
        }

        // Safety check: ensure we found valid bounds
        if (!isFinite(minX) || !isFinite(maxX)) {
            this.root = null;
            return;
        }

        // Add small padding
        const padding = 1;
        const bounds = new AABB(
            new Vec3(minX - padding, minY - padding, minZ - padding),
            new Vec3(maxX + padding, maxY + padding, maxZ + padding)
        );

        // Create root node
        this.root = this.getNode(bounds);
        this.nodeCount = 1;

        // Insert all particles
        for (let i = 0; i < count; i++) {
            this.insert(this.root, particles, i, 0);
        }

        // Compute centers of mass
        this.computeCenterOfMass(this.root, particles);

        this.buildTime = performance.now() - startTime;
    }

    /**
     * Insert a particle into the tree
     */
    insert(node, particles, index, depth) {
        // Track max depth
        if (depth > this.maxDepthReached) {
            this.maxDepthReached = depth;
        }

        const pos = new Vec3(
            particles.x[index],
            particles.y[index],
            particles.z[index]
        );

        // If this is a leaf node
        if (node.isLeaf) {
            // If we have room, add the particle
            if (node.particles.length < this.maxParticlesPerNode || depth >= this.maxDepth) {
                node.particles.push(index);
                return;
            }

            // Otherwise, subdivide
            this.subdivide(node, particles);
        }

        // Insert into appropriate child
        const octant = node.bounds.getOctant(pos);
        this.insert(node.children[octant], particles, index, depth + 1);
    }

    /**
     * Subdivide a node into 8 children
     */
    subdivide(node, particles) {
        node.isLeaf = false;
        node.children = new Array(8);

        for (let i = 0; i < 8; i++) {
            const childBounds = node.bounds.getOctantBounds(i);
            node.children[i] = this.getNode(childBounds);
            this.nodeCount++;
        }

        // Redistribute existing particles
        for (const index of node.particles) {
            const pos = new Vec3(
                particles.x[index],
                particles.y[index],
                particles.z[index]
            );
            const octant = node.bounds.getOctant(pos);
            node.children[octant].particles.push(index);
        }

        node.particles = [];
    }

    /**
     * Compute center of mass for all nodes (bottom-up)
     */
    computeCenterOfMass(node, particles) {
        if (node.isLeaf) {
            // Leaf node: compute from particles
            let totalMass = 0;
            let comX = 0, comY = 0, comZ = 0;

            for (const index of node.particles) {
                const mass = particles.mass[index];
                totalMass += mass;
                comX += particles.x[index] * mass;
                comY += particles.y[index] * mass;
                comZ += particles.z[index] * mass;
            }

            node.totalMass = totalMass;
            if (totalMass > 0) {
                node.centerOfMass.set(
                    comX / totalMass,
                    comY / totalMass,
                    comZ / totalMass
                );
            }
        } else {
            // Internal node: aggregate from children
            let totalMass = 0;
            let comX = 0, comY = 0, comZ = 0;

            for (const child of node.children) {
                this.computeCenterOfMass(child, particles);

                const mass = child.totalMass;
                totalMass += mass;
                comX += child.centerOfMass.x * mass;
                comY += child.centerOfMass.y * mass;
                comZ += child.centerOfMass.z * mass;
            }

            node.totalMass = totalMass;
            if (totalMass > 0) {
                node.centerOfMass.set(
                    comX / totalMass,
                    comY / totalMass,
                    comZ / totalMass
                );
            }
        }
    }

    /**
     * Calculate gravitational force on a particle
     * @param {number} index - Particle index
     * @param {Object} particles - Particle data
     * @param {number} G - Gravitational constant (scaled)
     * @param {number} softening - Softening length squared
     * @param {number} maxDistance - Maximum distance for gravity (optional)
     * @returns {Vec3} Force vector
     */
    calculateForce(index, particles, G, softeningSq, maxDistance = Infinity) {
        if (!this.root) return new Vec3();

        const pos = new Vec3(
            particles.x[index],
            particles.y[index],
            particles.z[index]
        );
        const mass = particles.mass[index];

        const force = new Vec3();
        this.traverseForForce(this.root, pos, mass, force, G, softeningSq, maxDistance);

        return force;
    }

    /**
     * ULTRA OPTIMIZED: Recursive force calculation using Barnes-Hut criterion
     * NOW WITH DISTANCE CUTOFF to prevent long-range clustering!
     * Optimized for maximum performance with minimal distance calculations
     */
    traverseForForce(node, pos, mass, force, G, softeningSq, maxDistance = Infinity) {
        // PERFORMANCE: Early exit if node is empty
        if (node.totalMass === 0) return;

        // PERFORMANCE: Calculate distance components once
        const dx = node.centerOfMass.x - pos.x;
        const dy = node.centerOfMass.y - pos.y;
        const dz = node.centerOfMass.z - pos.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        // PERFORMANCE: Skip self-interaction early (before sqrt)
        if (distSq < 1e-10) return;

        // CRITICAL: Distance cutoff to prevent long-range gravity
        // PERFORMANCE: Only calculate sqrt if we have a distance limit
        if (maxDistance < Infinity) {
            // OPTIMIZATION: Compare distSq to maxDistance^2 to avoid sqrt
            const maxDistSq = maxDistance * maxDistance;
            if (distSq > maxDistSq) {
                return; // Too far away - no gravity interaction!
            }
        }

        // PERFORMANCE: If this is a leaf or the opening angle criterion is satisfied
        // Using pre-computed thetaSquared for faster comparison
        const nodeSizeSq = node.size * node.size;
        if (node.isLeaf || (nodeSizeSq / distSq < this.thetaSquared)) {
            // Calculate force using softened gravity
            // PERFORMANCE: Fast inverse square root approximation
            const distSoftened = distSq + softeningSq;
            const invDist = 1.0 / Math.sqrt(distSoftened);
            const invDistCubed = invDist * invDist * invDist;
            const F = G * mass * node.totalMass * invDistCubed;

            force.x += F * dx;
            force.y += F * dy;
            force.z += F * dz;
        } else {
            // Recurse into children
            // PERFORMANCE: Use for loop instead of forEach for speed
            const children = node.children;
            const len = children.length;
            for (let i = 0; i < len; i++) {
                this.traverseForForce(children[i], pos, mass, force, G, softeningSq, maxDistance);
            }
        }
    }

    /**
     * Calculate forces for all particles
     * @returns {Object} Force arrays (fx, fy, fz)
     */
    calculateAllForces(particles, count, G, softening) {
        const softeningSq = softening * softening;

        const fx = new Float32Array(count);
        const fy = new Float32Array(count);
        const fz = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const force = this.calculateForce(i, particles, G, softeningSq);
            fx[i] = force.x;
            fy[i] = force.y;
            fz[i] = force.z;
        }

        return { fx, fy, fz };
    }

    /**
     * Get statistics about the octree
     */
    getStats() {
        return {
            nodeCount: this.nodeCount,
            maxDepth: this.maxDepthReached,
            buildTime: this.buildTime,
            theta: this.theta
        };
    }

    /**
     * Update theta (opening angle)
     */
    setTheta(theta) {
        this.theta = Math.max(0, Math.min(1, theta));
        this.thetaSquared = this.theta * this.theta;  // Update cached value
    }
}

export default Octree;
