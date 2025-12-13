/**
 * WebGPU Particle Renderer
 * Universe Evolution Simulator v2.47.3
 *
 * High-performance GPU-accelerated particle rendering
 */

import { VISUAL } from '../utils/constants.js';

export class WebGPURenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.device = null;
        this.context = null;
        this.pipeline = null;
        this.initialized = false;

        // Buffers
        this.vertexBuffer = null;
        this.particleBuffer = null;
        this.uniformBuffer = null;

        // Settings
        this.maxParticles = 4000000;
        this.particleSizeMultiplier = 1.0;

        // Stats
        this.renderTime = 0;
        this.visibleCount = 0;
    }

    /**
     * Initialize WebGPU
     */
    async init() {
        if (!navigator.gpu) {
            throw new Error('WebGPU not supported. Please use a browser that supports WebGPU (Chrome 113+, Edge 113+)');
        }

        // Request adapter and device
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
        });

        if (!adapter) {
            throw new Error('No WebGPU adapter found');
        }

        this.device = await adapter.requestDevice();

        // Configure canvas context
        this.context = this.canvas.getContext('webgpu');
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            device: this.device,
            format: presentationFormat,
            alphaMode: 'opaque'
        });

        // Create shader module
        const shaderModule = this.device.createShaderModule({
            label: 'Particle Shader',
            code: this.getShaderCode()
        });

        // Create pipeline
        this.pipeline = this.device.createRenderPipeline({
            label: 'Particle Pipeline',
            layout: 'auto',
            vertex: {
                module: shaderModule,
                entryPoint: 'vertexMain',
                buffers: [
                    {
                        // Vertex buffer (quad)
                        arrayStride: 2 * 4, // 2 floats
                        attributes: [{
                            shaderLocation: 0,
                            offset: 0,
                            format: 'float32x2'
                        }]
                    },
                    {
                        // Instance buffer (particle data)
                        arrayStride: 8 * 4, // 8 floats per particle
                        stepMode: 'instance',
                        attributes: [
                            {
                                shaderLocation: 1,
                                offset: 0,
                                format: 'float32x3' // position
                            },
                            {
                                shaderLocation: 2,
                                offset: 12,
                                format: 'float32x3' // color
                            },
                            {
                                shaderLocation: 3,
                                offset: 24,
                                format: 'float32' // size
                            },
                            {
                                shaderLocation: 4,
                                offset: 28,
                                format: 'float32' // brightness
                            }
                        ]
                    }
                ]
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fragmentMain',
                targets: [{
                    format: presentationFormat,
                    blend: {
                        color: {
                            srcFactor: 'src-alpha',
                            dstFactor: 'one',
                            operation: 'add'
                        },
                        alpha: {
                            srcFactor: 'one',
                            dstFactor: 'one',
                            operation: 'add'
                        }
                    }
                }]
            },
            primitive: {
                topology: 'triangle-strip'
            }
        });

        // Create quad vertex buffer (billboard)
        const quadVertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        this.vertexBuffer = this.device.createBuffer({
            label: 'Quad Vertex Buffer',
            size: quadVertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        this.device.queue.writeBuffer(this.vertexBuffer, 0, quadVertices);

        // Create particle instance buffer
        const particleDataSize = this.maxParticles * 8 * 4; // 8 floats per particle
        this.particleBuffer = this.device.createBuffer({
            label: 'Particle Instance Buffer',
            size: particleDataSize,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        // Create uniform buffer
        const uniformDataSize = 16 * 4; // 16 floats for view-projection matrix + extras
        this.uniformBuffer = this.device.createBuffer({
            label: 'Uniform Buffer',
            size: uniformDataSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // Create bind group
        this.bindGroup = this.device.createBindGroup({
            label: 'Particle Bind Group',
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: this.uniformBuffer }
            }]
        });

        this.initialized = true;
        console.log('WebGPU renderer initialized successfully');
    }

    /**
     * Get WGSL shader code
     */
    getShaderCode() {
        return `
struct Uniforms {
    viewProjection: mat4x4<f32>,
    cameraPos: vec3<f32>,
    zoom: f32,
    screenWidth: f32,
    screenHeight: f32,
    time: f32,
    particleSizeMultiplier: f32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexInput {
    @location(0) quadPos: vec2<f32>,
    @location(1) position: vec3<f32>,
    @location(2) color: vec3<f32>,
    @location(3) size: f32,
    @location(4) brightness: f32
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec3<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) brightness: f32
}

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    // Project particle to clip space
    let worldPos = vec4<f32>(input.position, 1.0);
    let clipPos = uniforms.viewProjection * worldPos;

    // Calculate billboard size in screen space
    let particleSize = input.size * uniforms.particleSizeMultiplier * uniforms.zoom;
    let screenSize = vec2<f32>(
        particleSize / uniforms.screenWidth * 2.0,
        particleSize / uniforms.screenHeight * 2.0
    );

    // Apply billboard offset
    output.position = clipPos;
    output.position.x += input.quadPos.x * screenSize.x * clipPos.w;
    output.position.y += input.quadPos.y * screenSize.y * clipPos.w;

    output.color = input.color / 255.0;
    output.uv = input.quadPos;
    output.brightness = input.brightness;

    return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
    // Circular particle shape
    let dist = length(input.uv);
    if (dist > 1.0) {
        discard;
    }

    // Smooth falloff
    let alpha = (1.0 - dist) * input.brightness;

    // Gaussian-like glow
    let glow = exp(-dist * dist * 2.0);
    let finalAlpha = alpha * glow * 0.8;

    return vec4<f32>(input.color * glow, finalAlpha);
}
`;
    }

    /**
     * Resize canvas
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    /**
     * Render particles
     */
    render(particles, camera, epoch, options = {}) {
        if (!this.initialized) {
            console.warn('WebGPU renderer not initialized');
            return 0;
        }

        const renderStart = performance.now();

        // Prepare particle data
        const particleData = this.prepareParticleData(particles, camera, options);
        if (particleData.count === 0) {
            return 0;
        }

        // Update particle buffer
        this.device.queue.writeBuffer(this.particleBuffer, 0, particleData.buffer);

        // Update uniforms
        this.updateUniforms(camera);

        // Create command encoder
        const commandEncoder = this.device.createCommandEncoder();

        const textureView = this.context.getCurrentTexture().createView();

        const renderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                loadOp: 'clear',
                storeOp: 'store'
            }]
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, this.bindGroup);
        passEncoder.setVertexBuffer(0, this.vertexBuffer);
        passEncoder.setVertexBuffer(1, this.particleBuffer);
        passEncoder.draw(4, particleData.count); // 4 vertices per quad, N instances
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);

        this.renderTime = performance.now() - renderStart;
        this.visibleCount = particleData.count;

        return particleData.count;
    }

    /**
     * Prepare particle data for GPU
     */
    prepareParticleData(particles, camera, options) {
        const p = particles.particles;
        const n = Math.min(particles.count, this.maxParticles);

        // Calculate how many particles to render based on performance
        const stride = Math.max(1, Math.floor(n / 150000));
        const renderCount = Math.floor(n / stride);

        const buffer = new Float32Array(renderCount * 8);
        let writeIndex = 0;
        let visibleCount = 0;

        for (let i = 0; i < n; i += stride) {
            // Project particle
            const projected = camera.project(p.x[i], p.y[i], p.z[i]);
            if (!projected.visible) continue;

            // Position (world space)
            buffer[writeIndex++] = p.x[i];
            buffer[writeIndex++] = p.y[i];
            buffer[writeIndex++] = p.z[i];

            // Color RGB
            buffer[writeIndex++] = p.colorR[i];
            buffer[writeIndex++] = p.colorG[i];
            buffer[writeIndex++] = p.colorB[i];

            // Size
            const size = Math.max(VISUAL.particleMinSize,
                (1.5 + p.size[i] * 0.5) * projected.perspective);
            buffer[writeIndex++] = size;

            // Brightness
            buffer[writeIndex++] = Math.min(1, 0.4 + p.brightness[i] * 0.6);

            visibleCount++;
        }

        return {
            buffer: buffer.slice(0, writeIndex),
            count: visibleCount
        };
    }

    /**
     * Update uniform buffer
     */
    updateUniforms(camera) {
        const uniforms = new Float32Array(16);

        // View-projection matrix (simplified orthographic for now)
        const zoom = camera.zoom;
        const aspect = this.canvas.width / this.canvas.height;

        // Create simple view-projection matrix
        uniforms[0] = zoom / aspect;  // scale x
        uniforms[1] = 0;
        uniforms[2] = 0;
        uniforms[3] = 0;

        uniforms[4] = 0;
        uniforms[5] = zoom;  // scale y
        uniforms[6] = 0;
        uniforms[7] = 0;

        uniforms[8] = 0;
        uniforms[9] = 0;
        uniforms[10] = 1;
        uniforms[11] = 0;

        uniforms[12] = -camera.x * zoom;  // translate x
        uniforms[13] = -camera.y * zoom;  // translate y
        uniforms[14] = 0;
        uniforms[15] = 1;

        this.device.queue.writeBuffer(this.uniformBuffer, 0, uniforms);

        // Additional uniforms (after matrix)
        const extras = new Float32Array([
            camera.x, camera.y, camera.z,  // camera position
            camera.zoom,
            this.canvas.width,
            this.canvas.height,
            performance.now() / 1000,
            this.particleSizeMultiplier
        ]);

        this.device.queue.writeBuffer(this.uniformBuffer, 16 * 4, extras);
    }

    /**
     * Render effects (vignette, grain, etc)
     */
    renderEffects() {
        // Effects will be added later with compute shaders
        this.effectsTime = 0;
    }

    /**
     * Get render statistics
     */
    getStats() {
        return {
            visibleParticles: this.visibleCount,
            renderTime: this.renderTime,
            effectsTime: 0,
            backend: 'WebGPU'
        };
    }

    /**
     * Set effects (compatibility with old renderer)
     */
    setEffects(effects) {
        // Store for future use
        this.effects = effects;
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.vertexBuffer) this.vertexBuffer.destroy();
        if (this.particleBuffer) this.particleBuffer.destroy();
        if (this.uniformBuffer) this.uniformBuffer.destroy();
        if (this.device) this.device.destroy();
    }
}

export default WebGPURenderer;
