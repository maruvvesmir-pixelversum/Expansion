/**
 * Math Utilities
 * Universe Evolution Simulator v2.47.3
 */

/**
 * 3D Vector operations
 */
export class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    mul(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    div(s) {
        if (s !== 0) {
            this.x /= s;
            this.y /= s;
            this.z /= s;
        }
        return this;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    normalize() {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
            this.z /= len;
        }
        return this;
    }

    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    distanceToSq(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }

    lerp(v, t) {
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        this.z += (v.z - this.z) * t;
        return this;
    }

    static add(a, b) {
        return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    static sub(a, b) {
        return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    static mul(v, s) {
        return new Vec3(v.x * s, v.y * s, v.z * s);
    }

    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    static cross(a, b) {
        return new Vec3(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }

    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    static lerp(a, b, t) {
        return new Vec3(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t,
            a.z + (b.z - a.z) * t
        );
    }
}

/**
 * 3x3 Matrix for rotations
 */
export class Mat3 {
    constructor() {
        this.m = new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]);
    }

    identity() {
        this.m.set([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        return this;
    }

    rotateX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.m.set([
            1, 0, 0,
            0, c, -s,
            0, s, c
        ]);
        return this;
    }

    rotateY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.m.set([
            c, 0, s,
            0, 1, 0,
            -s, 0, c
        ]);
        return this;
    }

    rotateZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.m.set([
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        ]);
        return this;
    }

    mulVec3(v) {
        const x = this.m[0] * v.x + this.m[1] * v.y + this.m[2] * v.z;
        const y = this.m[3] * v.x + this.m[4] * v.y + this.m[5] * v.z;
        const z = this.m[6] * v.x + this.m[7] * v.y + this.m[8] * v.z;
        return new Vec3(x, y, z);
    }

    mul(other) {
        const a = this.m;
        const b = other.m;
        const result = new Mat3();
        result.m.set([
            a[0]*b[0] + a[1]*b[3] + a[2]*b[6],
            a[0]*b[1] + a[1]*b[4] + a[2]*b[7],
            a[0]*b[2] + a[1]*b[5] + a[2]*b[8],
            a[3]*b[0] + a[4]*b[3] + a[5]*b[6],
            a[3]*b[1] + a[4]*b[4] + a[5]*b[7],
            a[3]*b[2] + a[4]*b[5] + a[5]*b[8],
            a[6]*b[0] + a[7]*b[3] + a[8]*b[6],
            a[6]*b[1] + a[7]*b[4] + a[8]*b[7],
            a[6]*b[2] + a[7]*b[5] + a[8]*b[8]
        ]);
        return result;
    }
}

/**
 * Axis-Aligned Bounding Box
 */
export class AABB {
    constructor(min = new Vec3(), max = new Vec3()) {
        this.min = min.clone();
        this.max = max.clone();
    }

    center() {
        return new Vec3(
            (this.min.x + this.max.x) / 2,
            (this.min.y + this.max.y) / 2,
            (this.min.z + this.max.z) / 2
        );
    }

    size() {
        return new Vec3(
            this.max.x - this.min.x,
            this.max.y - this.min.y,
            this.max.z - this.min.z
        );
    }

    maxSize() {
        return Math.max(
            this.max.x - this.min.x,
            this.max.y - this.min.y,
            this.max.z - this.min.z
        );
    }

    contains(point) {
        return point.x >= this.min.x && point.x <= this.max.x &&
               point.y >= this.min.y && point.y <= this.max.y &&
               point.z >= this.min.z && point.z <= this.max.z;
    }

    intersects(other) {
        return this.min.x <= other.max.x && this.max.x >= other.min.x &&
               this.min.y <= other.max.y && this.max.y >= other.min.y &&
               this.min.z <= other.max.z && this.max.z >= other.min.z;
    }

    expand(point) {
        this.min.x = Math.min(this.min.x, point.x);
        this.min.y = Math.min(this.min.y, point.y);
        this.min.z = Math.min(this.min.z, point.z);
        this.max.x = Math.max(this.max.x, point.x);
        this.max.y = Math.max(this.max.y, point.y);
        this.max.z = Math.max(this.max.z, point.z);
        return this;
    }

    getOctant(point) {
        const center = this.center();
        let octant = 0;
        if (point.x > center.x) octant |= 1;
        if (point.y > center.y) octant |= 2;
        if (point.z > center.z) octant |= 4;
        return octant;
    }

    getOctantBounds(octant) {
        const center = this.center();
        const min = new Vec3();
        const max = new Vec3();

        min.x = (octant & 1) ? center.x : this.min.x;
        max.x = (octant & 1) ? this.max.x : center.x;
        min.y = (octant & 2) ? center.y : this.min.y;
        max.y = (octant & 2) ? this.max.y : center.y;
        min.z = (octant & 4) ? center.z : this.min.z;
        max.z = (octant & 4) ? this.max.z : center.z;

        return new AABB(min, max);
    }
}

/**
 * Random number generators
 */
export const Random = {
    // Uniform random [0, 1)
    random: Math.random,

    // Uniform random [min, max)
    range(min, max) {
        return min + Math.random() * (max - min);
    },

    // Gaussian distribution (Box-Muller transform)
    gaussian(mean = 0, stdDev = 1) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * stdDev + mean;
    },

    // Random point in unit sphere
    inSphere() {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = Math.cbrt(Math.random());
        return new Vec3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
    },

    // Random point on unit sphere surface
    onSphere() {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        return new Vec3(
            Math.sin(phi) * Math.cos(theta),
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi)
        );
    },

    // Power-law distribution
    powerLaw(alpha, xmin = 1) {
        const u = Math.random();
        return xmin * Math.pow(1 - u, -1 / (alpha - 1));
    }
};

/**
 * Numerical integration methods
 */
export const Integrate = {
    // Euler method (first order)
    euler(y, dydt, dt) {
        return y + dydt * dt;
    },

    // Midpoint method (second order)
    midpoint(y, dydt, dt, f) {
        const k1 = dydt;
        const k2 = f(y + k1 * dt / 2);
        return y + k2 * dt;
    },

    // Velocity Verlet (second order symplectic)
    velocityVerlet(x, v, a, dt, getAcceleration) {
        // Half-step velocity
        const vHalf = v + a * dt / 2;
        // Full-step position
        const xNew = x + vHalf * dt;
        // New acceleration at new position
        const aNew = getAcceleration(xNew);
        // Full-step velocity
        const vNew = vHalf + aNew * dt / 2;
        return { x: xNew, v: vNew, a: aNew };
    },

    // Leapfrog (second order symplectic)
    leapfrog(x, v, a, dt) {
        const vNew = v + a * dt;
        const xNew = x + vNew * dt;
        return { x: xNew, v: vNew };
    },

    // RK4 (fourth order)
    rk4(y, t, dt, f) {
        const k1 = f(t, y);
        const k2 = f(t + dt/2, y + k1 * dt/2);
        const k3 = f(t + dt/2, y + k2 * dt/2);
        const k4 = f(t + dt, y + k3 * dt);
        return y + (k1 + 2*k2 + 2*k3 + k4) * dt / 6;
    }
};

/**
 * Interpolation functions
 */
export const Interpolate = {
    linear(a, b, t) {
        return a + (b - a) * t;
    },

    smoothstep(a, b, t) {
        t = Math.max(0, Math.min(1, t));
        t = t * t * (3 - 2 * t);
        return a + (b - a) * t;
    },

    smootherstep(a, b, t) {
        t = Math.max(0, Math.min(1, t));
        t = t * t * t * (t * (t * 6 - 15) + 10);
        return a + (b - a) * t;
    },

    cosine(a, b, t) {
        const t2 = (1 - Math.cos(t * Math.PI)) / 2;
        return a + (b - a) * t2;
    },

    cubic(a, b, c, d, t) {
        const t2 = t * t;
        const a0 = d - c - a + b;
        const a1 = a - b - a0;
        const a2 = c - a;
        return a0 * t * t2 + a1 * t2 + a2 * t + b;
    }
};

/**
 * Utility functions
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function inverseLerp(a, b, value) {
    return (value - a) / (b - a);
}

export function remap(value, inMin, inMax, outMin, outMax) {
    const t = inverseLerp(inMin, inMax, value);
    return lerp(outMin, outMax, t);
}

export function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

export function radToDeg(radians) {
    return radians * 180 / Math.PI;
}

export function wrap(value, min, max) {
    const range = max - min;
    return min + ((((value - min) % range) + range) % range);
}

export function isPowerOfTwo(value) {
    return (value & (value - 1)) === 0 && value !== 0;
}

export function nextPowerOfTwo(value) {
    value--;
    value |= value >> 1;
    value |= value >> 2;
    value |= value >> 4;
    value |= value >> 8;
    value |= value >> 16;
    value++;
    return value;
}

/**
 * Statistics functions
 */
export const Stats = {
    mean(arr) {
        if (arr.length === 0) return 0;
        let sum = 0;
        for (let i = 0; i < arr.length; i++) sum += arr[i];
        return sum / arr.length;
    },

    variance(arr) {
        if (arr.length === 0) return 0;
        const m = this.mean(arr);
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
            const d = arr[i] - m;
            sum += d * d;
        }
        return sum / arr.length;
    },

    stdDev(arr) {
        return Math.sqrt(this.variance(arr));
    },

    min(arr) {
        if (arr.length === 0) return 0;
        let min = arr[0];
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] < min) min = arr[i];
        }
        return min;
    },

    max(arr) {
        if (arr.length === 0) return 0;
        let max = arr[0];
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] > max) max = arr[i];
        }
        return max;
    },

    median(arr) {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }
};

export default { Vec3, Mat3, AABB, Random, Integrate, Interpolate, Stats };
