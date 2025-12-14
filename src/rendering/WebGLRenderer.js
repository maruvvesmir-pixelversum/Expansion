/**
 * WebGL Particle Renderer
 * High-performance 3D particle rendering using WebGL
 */

export class WebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = null;
        this.program = null;
        this.particleBuffer = null;
        this.particleData = null;  // Reusable buffer
        this.initialized = false;

        this.maxParticles = 100000;
        this.visibleCount = 0;
        this.renderTime = 0;

        // Performance tracking
        this.frameCount = 0;
        this.lastFpsTime = performance.now();
        this.fps = 60;

        this.effects = {
            bloom: true,
            bloomIntensity: 0.7,
            motionBlur: true,
            filmGrain: true,
            vignette: true,
            cosmicWeb: false
        };
    }

    init() {
        // Validate canvas first
        if (!this.canvas) {
            throw new Error('Canvas element is null or undefined');
        }

        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
        console.log('Canvas clientWidth:', this.canvas.clientWidth, 'clientHeight:', this.canvas.clientHeight);

        // CRITICAL FIX: Use failIfMajorPerformanceCaveat: false to allow software rendering
        // This is essential for cloud/container environments without GPU
        console.log('Attempting to create WebGL context...');

        // Try WebGL 2 first with relaxed settings
        this.gl = this.canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            depth: true,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false  // CRITICAL: Allow software rendering!
        });

        if (!this.gl) {
            console.warn('⚠️ WebGL 2 unavailable, trying WebGL 1...');
            // Try WebGL 1 with relaxed settings
            this.gl = this.canvas.getContext('webgl', {
                alpha: false,
                antialias: false,
                depth: true,
                preserveDrawingBuffer: false,
                failIfMajorPerformanceCaveat: false  // CRITICAL: Allow software rendering!
            });
        }

        if (!this.gl) {
            console.warn('⚠️ Standard WebGL unavailable, trying experimental-webgl...');
            // Last resort: try experimental WebGL
            this.gl = this.canvas.getContext('experimental-webgl', {
                alpha: false,
                antialias: false,
                depth: true,
                preserveDrawingBuffer: false,
                failIfMajorPerformanceCaveat: false
            });
        }

        if (!this.gl) {
            console.error('❌ ALL WebGL CONTEXT CREATION ATTEMPTS FAILED');
            console.error('Possible causes:');
            console.error('  1. Hardware acceleration disabled in browser');
            console.error('  2. No GPU in cloud/container environment');
            console.error('  3. Browser security settings blocking WebGL');
            console.error('  4. Too many WebGL contexts (try refreshing page)');
            console.error('\nTroubleshooting:');
            console.error('  - Chrome: chrome://settings → System → Enable hardware acceleration');
            console.error('  - Firefox: about:config → webgl.force-enabled = true');
            console.error('  - Edge: edge://settings/system → Enable hardware acceleration');
            throw new Error('WebGL unavailable - hardware acceleration may be disabled');
        }

        const glVersion = this.gl.getParameter(this.gl.VERSION);
        const glRenderer = this.gl.getParameter(this.gl.RENDERER);
        console.log('✅ WebGL context created successfully!');
        console.log('  Version:', glVersion);
        console.log('  Renderer:', glRenderer);

        const gl = this.gl;

        // Enable blending and depth testing for 3D
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);  // Additive blending
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearColor(0, 0, 0, 1);

        // Vertex shader with enhanced 3D depth
        const vsSource = `
            attribute vec3 aPosition;
            attribute float aSize;
            attribute vec3 aColor;
            attribute float aBrightness;

            uniform vec2 uScreenSize;
            uniform vec3 uCamera;
            uniform float uZoom;

            varying vec3 vColor;
            varying float vAlpha;
            varying float vDepth;

            void main() {
                // Transform to view space
                vec3 pos = aPosition - uCamera;

                // Enhanced perspective with focal length
                float focalLength = 300.0;
                float depth = pos.z + 150.0;
                float perspective = focalLength / (focalLength + depth);

                // Project to screen with stronger 3D effect
                vec2 screen = pos.xy * uZoom * perspective * 100.0;

                // Convert to NDC
                vec2 ndc = screen / (uScreenSize * 0.5);
                ndc.y = -ndc.y;

                gl_Position = vec4(ndc, depth * 0.001, 1.0);  // Use depth for z-buffer
                gl_PointSize = (aSize + 2.0) * 5.0 * perspective;

                // Depth fog effect
                float depthFade = clamp(1.0 - depth / 500.0, 0.2, 1.0);

                vColor = aColor;
                vAlpha = aBrightness * 0.9 * depthFade;
                vDepth = perspective;
            }
        `;

        // Fragment shader with glow effect
        const fsSource = `
            precision mediump float;

            varying vec3 vColor;
            varying float vAlpha;
            varying float vDepth;

            void main() {
                // Circular particle with soft edges
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center) * 2.0;

                if (dist > 1.0) {
                    discard;
                }

                // Soft glow falloff
                float fade = 1.0 - smoothstep(0.0, 1.0, dist);
                fade = fade * fade;  // Quadratic falloff for softer glow

                gl_FragColor = vec4(vColor, vAlpha * fade);
            }
        `;

        // Compile shaders
        const vertexShader = this.compileShader(gl, vsSource, gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

        // Create program
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            throw new Error('Program link failed: ' + gl.getProgramInfoLog(this.program));
        }

        // Get attribute/uniform locations
        this.locations = {
            aPosition: gl.getAttribLocation(this.program, 'aPosition'),
            aSize: gl.getAttribLocation(this.program, 'aSize'),
            aColor: gl.getAttribLocation(this.program, 'aColor'),
            aBrightness: gl.getAttribLocation(this.program, 'aBrightness'),
            uScreenSize: gl.getUniformLocation(this.program, 'uScreenSize'),
            uCamera: gl.getUniformLocation(this.program, 'uCamera'),
            uZoom: gl.getUniformLocation(this.program, 'uZoom')
        };

        // Create buffer and allocate max size
        this.particleBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.maxParticles * 8 * 4, gl.DYNAMIC_DRAW);

        this.initialized = true;
        console.log('✅ WebGL Renderer initialized - 100k particles ready');
    }

    compileShader(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('Shader compile failed: ' + error);
        }

        return shader;
    }

    render(particles, camera, epoch, options = {}) {
        if (!this.initialized) return 0;

        const startTime = performance.now();
        const gl = this.gl;
        const count = Math.min(particles.count, this.maxParticles);

        // Reuse buffer if possible
        if (!this.particleData || this.particleData.length < count * 8) {
            this.particleData = new Float32Array(this.maxParticles * 8);
        }

        // Prepare particle data (interleaved: x, y, z, size, r, g, b, brightness)
        const data = this.particleData;
        const p = particles.particles;

        // Check if epoch has multi-layer colors (for superheated early universe)
        const hasLayers = epoch.colorLayer1 || epoch.colorLayer2;
        const baseColor = epoch.color || { r: 255, g: 255, b: 255 };

        for (let i = 0; i < count; i++) {
            if (!p.active[i]) continue;

            const offset = i * 8;
            data[offset + 0] = p.x[i];
            data[offset + 1] = p.y[i];
            data[offset + 2] = p.z[i];

            // Apply blur to size (blurry particles appear larger)
            const blur = p.blur[i] || 0;
            const effectiveSize = p.size[i] * (1.0 + blur * 0.5);
            data[offset + 3] = effectiveSize;

            // Use layered colors for early epochs if available
            if (hasLayers && blur > 0.5) {
                // Mix core color with layers based on blur
                const layer1 = epoch.colorLayer1 || baseColor;
                const blurFactor = Math.min(blur / 3.0, 1.0);

                data[offset + 4] = (baseColor.r * (1 - blurFactor) + layer1.r * blurFactor) / 255;
                data[offset + 5] = (baseColor.g * (1 - blurFactor) + layer1.g * blurFactor) / 255;
                data[offset + 6] = (baseColor.b * (1 - blurFactor) + layer1.b * blurFactor) / 255;
            } else {
                // Normal particle coloring
                data[offset + 4] = p.colorR[i] / 255;
                data[offset + 5] = p.colorG[i] / 255;
                data[offset + 6] = p.colorB[i] / 255;
            }

            data[offset + 7] = p.brightness[i];
        }

        // Upload data (use subData for better performance)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, count * 8));

        // Clear color and depth
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Use program
        gl.useProgram(this.program);

        // Set uniforms
        gl.uniform2f(this.locations.uScreenSize, this.canvas.width, this.canvas.height);
        gl.uniform3f(this.locations.uCamera, -camera.x, -camera.y, camera.z);
        gl.uniform1f(this.locations.uZoom, camera.zoom);

        // Set attributes (interleaved)
        const stride = 8 * 4;  // 8 floats per particle, 4 bytes per float

        gl.enableVertexAttribArray(this.locations.aPosition);
        gl.vertexAttribPointer(this.locations.aPosition, 3, gl.FLOAT, false, stride, 0);

        gl.enableVertexAttribArray(this.locations.aSize);
        gl.vertexAttribPointer(this.locations.aSize, 1, gl.FLOAT, false, stride, 12);

        gl.enableVertexAttribArray(this.locations.aColor);
        gl.vertexAttribPointer(this.locations.aColor, 3, gl.FLOAT, false, stride, 16);

        gl.enableVertexAttribArray(this.locations.aBrightness);
        gl.vertexAttribPointer(this.locations.aBrightness, 1, gl.FLOAT, false, stride, 28);

        // Draw
        gl.drawArrays(gl.POINTS, 0, count);

        this.visibleCount = count;
        this.renderTime = performance.now() - startTime;

        // Track FPS
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = now;
        }

        return count;
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        if (this.gl) {
            this.gl.viewport(0, 0, width, height);
        }
    }

    renderEffects() {
        // Stub for compatibility
    }

    getStats() {
        return {
            visibleParticles: this.visibleCount,
            renderTime: this.renderTime,
            renderer: 'WebGL'
        };
    }

    setEffects(effects) {
        Object.assign(this.effects, effects);
    }

    destroy() {
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
    }
}

export default WebGLRenderer;
