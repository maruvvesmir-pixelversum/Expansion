/**
 * Camera Controller
 * Universe Evolution Simulator v2.47.3
 *
 * Handles 3D camera transformations and projections
 */

import { VISUAL } from '../utils/constants.js';
import { Vec3, Mat3, clamp } from '../utils/math.js';

export class Camera {
    constructor(config = {}) {
        // Position
        this.x = config.x ?? 0;
        this.y = config.y ?? 0;
        this.z = config.z ?? VISUAL.cameraDistance;

        // Rotation (Euler angles)
        this.rotationX = config.rotationX ?? 0;
        this.rotationY = config.rotationY ?? 0;
        this.rotationZ = config.rotationZ ?? 0;

        // Zoom
        this.zoom = config.zoom ?? VISUAL.defaultZoom;
        this.targetZoom = this.zoom;
        this.zoomSpeed = 0.1;

        // Field of view
        this.fov = config.fov ?? VISUAL.defaultFOV;

        // Target for smooth following
        this.target = new Vec3();
        this.followTarget = false;
        this.followSpeed = 0.05;

        // Cached rotation matrices
        this.rotationMatrixX = new Mat3();
        this.rotationMatrixY = new Mat3();
        this.needsUpdate = true;

        // Precomputed trig values
        this.cosRotX = 1;
        this.sinRotX = 0;
        this.cosRotY = 1;
        this.sinRotY = 0;
        this.cosRotZ = 1;
        this.sinRotZ = 0;

        // Viewport
        this.width = 1920;
        this.height = 1080;
        this.aspect = this.width / this.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    /**
     * Set viewport size
     */
    setViewport(width, height) {
        this.width = width;
        this.height = height;
        this.aspect = width / height;
        this.centerX = width / 2;
        this.centerY = height / 2;
    }

    /**
     * Update rotation matrices
     */
    updateRotation() {
        if (!this.needsUpdate) return;

        this.cosRotX = Math.cos(this.rotationX);
        this.sinRotX = Math.sin(this.rotationX);
        this.cosRotY = Math.cos(this.rotationY);
        this.sinRotY = Math.sin(this.rotationY);
        this.cosRotZ = Math.cos(this.rotationZ);
        this.sinRotZ = Math.sin(this.rotationZ);

        this.rotationMatrixX.rotateX(this.rotationX);
        this.rotationMatrixY.rotateY(this.rotationY);

        this.needsUpdate = false;
    }

    /**
     * Update camera (interpolations, following)
     */
    update(dt) {
        // Smooth zoom
        if (Math.abs(this.zoom - this.targetZoom) > 0.001) {
            this.zoom += (this.targetZoom - this.zoom) * this.zoomSpeed;
        }

        // Follow target if enabled
        if (this.followTarget) {
            this.x += (this.target.x - this.x) * this.followSpeed;
            this.y += (this.target.y - this.y) * this.followSpeed;
        }
    }

    /**
     * Project a 3D world point to 2D screen coordinates
     */
    project(worldX, worldY, worldZ) {
        this.updateRotation();

        // Apply camera rotations
        // First rotate around Y axis
        const x1 = worldX * this.cosRotY - worldZ * this.sinRotY;
        const z1 = worldX * this.sinRotY + worldZ * this.cosRotY;

        // Then rotate around X axis
        const y1 = worldY * this.cosRotX - z1 * this.sinRotX;
        const z2 = worldY * this.sinRotX + z1 * this.cosRotX;

        // Perspective projection
        const perspective = 500 / (500 + z2 + this.z);

        // Apply zoom and offset
        const screenX = this.centerX + this.x + x1 * this.zoom * perspective;
        const screenY = this.centerY + this.y + y1 * this.zoom * perspective;

        return {
            x: screenX,
            y: screenY,
            z: z2,
            perspective: perspective,
            visible: screenX >= -50 && screenX <= this.width + 50 &&
                     screenY >= -50 && screenY <= this.height + 50 &&
                     z2 > -400
        };
    }

    /**
     * Project with full details for rendering
     */
    projectParticle(x, y, z, size, brightness) {
        const projected = this.project(x, y, z);

        if (!projected.visible) return null;

        return {
            ...projected,
            size: Math.max(0.3, size * projected.perspective * this.zoom),
            alpha: Math.min(1, 0.4 + brightness * 0.6) * projected.perspective
        };
    }

    /**
     * Unproject screen coordinates to world ray
     */
    unproject(screenX, screenY) {
        this.updateRotation();

        // Convert to NDC
        const ndcX = (screenX - this.centerX - this.x) / this.zoom;
        const ndcY = (screenY - this.centerY - this.y) / this.zoom;

        // Create ray direction
        const dir = new Vec3(ndcX, ndcY, -500);

        // Inverse rotation
        // (simplified - for accurate unprojection would need proper inverse)

        return {
            origin: new Vec3(-this.x, -this.y, this.z),
            direction: dir.normalize()
        };
    }

    /**
     * Pan camera
     */
    pan(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    /**
     * Rotate camera
     */
    rotate(dx, dy) {
        this.rotationY += dx;
        this.rotationX += dy;

        // Clamp vertical rotation
        this.rotationX = clamp(this.rotationX, -Math.PI / 2, Math.PI / 2);

        this.needsUpdate = true;
    }

    /**
     * Set zoom level
     */
    setZoom(zoom, instant = false) {
        this.targetZoom = clamp(zoom, VISUAL.minZoom, VISUAL.maxZoom);
        if (instant) {
            this.zoom = this.targetZoom;
        }
    }

    /**
     * Zoom by factor
     */
    zoomBy(factor) {
        this.setZoom(this.zoom * factor);
    }

    /**
     * Move camera along its local axes
     */
    move(forward, right, up) {
        this.updateRotation();

        // Forward/backward (along view direction)
        this.z -= forward;

        // Right/left
        this.x += right;

        // Up/down
        this.y += up;
    }

    /**
     * Reset to default position
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.z = VISUAL.cameraDistance;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.zoom = VISUAL.defaultZoom;
        this.targetZoom = this.zoom;
        this.needsUpdate = true;
    }

    /**
     * Look at a specific point
     */
    lookAt(target) {
        this.target.copy(target);

        // Calculate rotation to look at target
        const dx = target.x - (-this.x);
        const dy = target.y - (-this.y);
        const dz = target.z - this.z;

        this.rotationY = Math.atan2(dx, dz);
        this.rotationX = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));

        this.needsUpdate = true;
    }

    /**
     * Set position
     */
    setPosition(x, y, z) {
        this.x = -x;  // Camera offset is inverted
        this.y = -y;
        this.z = z;
    }

    /**
     * Get camera state for UI
     */
    getState() {
        return {
            position: { x: -this.x, y: -this.y, z: this.z },
            rotation: {
                x: (this.rotationX * 180 / Math.PI).toFixed(1) + '°',
                y: (this.rotationY * 180 / Math.PI).toFixed(1) + '°'
            },
            zoom: this.zoom.toFixed(2) + 'x',
            fov: this.fov + '°'
        };
    }

    /**
     * Get view scale description
     */
    getViewScale() {
        // Approximate scale based on zoom
        if (this.zoom < 0.2) return '1 Gpc';
        if (this.zoom < 0.5) return '100 Mpc';
        if (this.zoom < 1) return '10 Mpc';
        if (this.zoom < 2) return '1 Mpc';
        if (this.zoom < 5) return '100 kpc';
        if (this.zoom < 10) return '10 kpc';
        if (this.zoom < 20) return '1 kpc';
        return '100 pc';
    }
}

export default Camera;
