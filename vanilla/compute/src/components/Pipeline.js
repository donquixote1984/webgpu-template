import Texture from "./Texture";
export default class Pipeline {
    device = window.__WGPU_CONTEXT__.device;
    name = null;
    nativePipeline = null;
    storageBindGroup = null;
    textureBindGroup = null;
    samplerBindGroup = null;
    buffers = [];
    textures = [];
    static async createShader(shader) {
        const response = await fetch(shader);
        const s = await response.text();
        const device = window.__WGPU_CONTEXT__.device;
        const shaderModule = device.createShaderModule({
            label: shader,
            code:  s
        });
        return shaderModule;
    }

    static async createPipeline({shaderPath}) {
        const p = new Pipeline();
        p.name = shaderPath;
        return p;
    }

    addBuffer(buff) {
        this.buffers.push(buff);
    }
    hasTexture() {
        return this.textures.length > 0;
    }
    async addTexture(url) {

        const t = await Texture.load(url);
        this.textures.push(t);
        return {
            width: t.width,
            height: t.height
        }
        //this.textureBindGroup.addBindGroupEntry({nativeTexture: t.nativeTexture, name: url, });
    }

    addEmptyTexture(width, height) {
        const t = Texture.create(width, height);
        this.textures.push(t);
        return {
            texture: t,
            width,
            height
        }
    }

    getStorageBindGroup() {
        if (!this.storageBindGroup) {
            this.storageBindGroup = this.device.createBindGroup({
                layout: this.nativePipeline.getBindGroupLayout(0),
                entries: this.buffers.map((b, index) => ({binding: index, resource: {buffer: b.nativeBuffer}}))
            })
        }

        return this.storageBindGroup;
    }
    getTextureBindGroup() {
        if (!this.textureBindGroup) {
            this.textureBindGroup = this.device.createBindGroup({
                layout: this.nativePipeline.getBindGroupLayout(1),
                entries: this.textures.map((t, index) => ({
                    binding: index,
                    resource: t.nativeTexture.createView()
                }))
            })
        }

        return this.textureBindGroup;
    }

    getSamplerBindGroup() {
        if (!this.samplerBindGroup) {
            const sampler = this.device.createSampler({
                magFilter: 'linear',
                minFilter: 'linear'
            });
            this.samplerBindGroup = this.device.createBindGroup({
                layout: this.nativePipeline.getBindGroupLayout(2),
                entries: [{ 
                    binding: 0,
                    resource: sampler
                }]
            })
        }

        return this.samplerBindGroup;
    }

    getTargetBuffer() {
        return this.buffers.filter(b => b.isTarget)[0];
    }

    async ready() {
        const shaderModule = await Pipeline.createShader(this.name);
        this.nativePipeline = this.device.createComputePipeline({
            label: 'compute pipeline',
            layout: 'auto',
            compute: {
                module: shaderModule
            }
        });
    }

    async renderReady() {
        const shaderModule = await Pipeline.createShader(this.name);
        this.nativePipeline = this.device.createRenderPipeline({
            label: 'render pipeline',
            layout: 'auto',
            vertex: {
                module: shaderModule
            },
            fragment: {
                module: shaderModule,
                targets: [{
                    format: __WGPU_CONTEXT__.format
                }]
            }
        });
    }
}

export class PipelineBasic {
    static async create() {
        return await Pipeline.createPipeline({
            shaderPath: '/shader/basic.wgsl'
        })
    }
}

export class PipelineMatrix {
    static async create() {
        return await Pipeline.createPipeline({
            shaderPath: '/shader/matrix.wgsl'
        })
    }
}

export class PipelineImageBlur {
    static async create() {
        return await Pipeline.createPipeline({
            shaderPath: '/shader/blur.wgsl'
        })
    }
}
export class PipelineHistogram {
    static async create() {
        return await Pipeline.createPipeline({
            shaderPath: '/shader/histogram.wgsl'
        })
    }
}

export class PipelineHistogramChunk {
    static async create() {
        return await Pipeline.createPipeline({
            shaderPath: '/shader/histogram_chunk.wgsl'
        })
    }
    static async createSum() {
        return await Pipeline.createPipeline({
            shaderPath: '/shader/histogram_chunksum.wgsl'
        })
    }
}
export class PipelineCanvas {
    static async create() {
        return await Pipeline.createPipeline({
            shaderPath: '/shader/canvas.wgsl'
        })
    }

    static createBindGroup({pipeline, texture}) {
        if (!texture) {
            throw new Error('no texture');
        }
        const {device} = __WGPU_CONTEXT__;
        const sampler = device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
          });
        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0, 
                    resource: texture.createView()
                },
                {
                    binding: 1,
                    resource: sampler
                }
            ]
        });
        return bindGroup;
    }
}