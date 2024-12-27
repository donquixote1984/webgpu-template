
import {BufferLayout2DSimple, BufferLayout2DUV, BufferLayout3D33, BufferLayout3DSimple, BufferLayout3D332} from './Buffer';
import { BINDGROUPTYPE, DEFAULT_BUFFER_SIZE, TEXTURE_TYPE} from './constants';
import BindGroup from './BindGroup';
import Texture from './Texture';
export default class Pipeline {
    uniformBindGroup = null;// new BindGroup 
    textureBindGroup = new BindGroup({name: `group${1}`, groupIndex: 1, pipeline: this});
    /***
     * [
     * [{
     * index,
     * buffer
     * }, bind2, bind3] // group1
     * [bind1, bind2, bind3] // group2
     * ]
     * 
    */
    device = window.__WGPU_CONTEXT__.device;
    name = null;
    pipeline = null;
    hasCreatedBindGroup = false;
    vertexLayout = null;
    textureSlots = []; 

    // nativeBindGroups = [];  nativeBindGroup lives inside of bindGroups after createBindGroup
    textures = [];
    constructor() {
    }
    hasBinding() {
        return this.uniformBindGroup != null;
    }
    hasSelfTexture() {
        return this.textureBindGroup.entries.length > 0;
    }

    async addTexture(url) {
        const t = await Texture.create(url);
        //this.textures.push(t);
        this.textureBindGroup.addBindGroupEntry({nativeTexture: t.nativeTexture, name: url, });
    }
    hasTextureBinding() {
        return this.textureSlots.length > 0;
    }
    
    static async createShader(shader, numOfbindGroups = 0) {
        const response = await fetch(shader);
        const s = await response.text();
        const device = window.__WGPU_CONTEXT__.device;
        const format = window.__WGPU_CONTEXT__.format;
        const shaderModule = device.createShaderModule({
            label: shader,
            code:  s
        });
        return shaderModule;
    }

    static async createPipeline({shaderPath, vertexLayout, textureSlots = []}) {
        //this.pipeline = pipeline;
        //this.
        const pipeline = new Pipeline();
        pipeline.name = shaderPath;
        pipeline.vertexLayout = vertexLayout;
        pipeline.textureSlots = textureSlots;
        return pipeline;
    }
    addUniformBindGroup({group = 0, index = 0, type=BINDGROUPTYPE.UNIFORM, buffer, texture, sampler, name = 'unknown', isDynamic = false, size=DEFAULT_BUFFER_SIZE}) {
        this.uniformBindGroup =  this.uniformBindGroup || new BindGroup({name: `group${group}`, groupIndex: group, pipeline: this});
        this.uniformBindGroup.addBindGroupEntry({index, nativeBuffer: buffer, nativeTexture: texture, nativeSampler: sampler, name, isDynamic, size, type});
    }

    createUniformBindGroup() {
      
        if (this.uniformBindGroup.nativeBindGroup != null) {
            return this.uniformBindGroup;
        }

        /*
        this.bindGroups.map((bindGroup) => { 
            bindGroup.createBindGroup();
        });
        */
       this.uniformBindGroup.createBindGroup();
        return this.uniformBindGroup;
    }
    createTextureBindGroup() {
        if (this.textureBindGroup.nativeBindGroup != null) {
            return this.textureBindGroup;
        }

        this.textureBindGroup.createBindGroup();
    }

    setValue(group, name, value) {
        //this.rr[group].filter(g => g.name === name)
    }

    async ready(implicitLayout = false) {
        const device = window.__WGPU_CONTEXT__.device;
        const format = window.__WGPU_CONTEXT__.format;
        const shaderModule = await Pipeline.createShader(this.name);
        let layout = 'auto'
        if (implicitLayout) {
            /*
            const bindGroupLayouts = this.bindGroups.map(bindGroup => {
                return device.createBindGroupLayout(bindGroup.getLayoutDesc())
            })
            */
           const bindGroupLayouts = [device.createBindGroupLayout(this.uniformBindGroup.getLayoutDesc())];
           if (this.textureSlots.length > 0) {
            // texture entries
            const textureLayoutEntries = this.textureSlots.map((ts, index) => ({
                binding: index,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {
                    sampleType: "float",
                    viewDimension: "2d",
                    multisampled: false,
                  },
            }));
            bindGroupLayouts.push(device.createBindGroupLayout({entries: textureLayoutEntries}));
            // sampler
            bindGroupLayouts.push(device.createBindGroupLayout({entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {
                    type: "filtering",
                  },
            }]}))
           }
           
            layout = device.createPipelineLayout({
                bindGroupLayouts: bindGroupLayouts,
            });
        }

        this.pipeline = device.createRenderPipeline({
            label: 'pipeline',
            layout,
            vertex: {
              module: shaderModule,
              buffers: this.vertexLayout,
            },
            fragment: {
              module: shaderModule,
              targets: [{ format }],
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },
        });

        if (this.hasBinding()) {
            this.createUniformBindGroup();
        }
        if (this.hasSelfTexture()) {
            this.createTextureBindGroup();
        }
    }
}


export class Pipeline2DSimple
{
    static async create() {
        return Pipeline.createPipeline({
            shaderPath: '/shader/2dsimple.wgsl',
            vertexLayout: [
                BufferLayout2DSimple
            ]
        })
    }
}
export class PipelineCanvas {
    static async create() {
        return Pipeline.createPipeline({
            shaderPath: '/shader/canvas.wgsl',
            vertexLayout: [
                BufferLayout2DUV
            ],
            textureSlots: [TEXTURE_TYPE.DIFFUSE]
        })
    }
}

export class Pipeline3DSimple
{
    static async create() {
        return await Pipeline.createPipeline({
            shaderPath: '/shader/3dsimple.wgsl',
            vertexLayout: [
                BufferLayout3DSimple
            ]
        })
    }
}

export class Pipeline3DCamera {
    static async create() {
        return Pipeline.createPipeline({
            shaderPath: '/shader/3dcamera.wgsl',
            vertexLayout: [
                BufferLayout3DSimple
            ]
        })
    }
    
}

export class Pipeline3D33 {
    static async create() {
        return Pipeline.createPipeline({
            shaderPath: '/shader/3d33.wgsl',
            vertexLayout: [
                BufferLayout3D33
            ]
        })
    }
}

export class Pipeline3DMultiple {
    static async create() {
        return Pipeline.createPipeline({
            shaderPath: '/shader/3dmultipleobjs.wgsl',
            vertexLayout: [
                BufferLayout3D332
            ]
        })
    }
}

export class Pipeline3DMultipleTextured {
    static async create() {
        return Pipeline.createPipeline({
            shaderPath: '/shader/3dmultipleobjstexture.wgsl',
            vertexLayout: [
                BufferLayout3D332
            ],
            textureSlots:  [TEXTURE_TYPE.DIFFUSE, /*TEXTURE_TYPE.NORMAL, TEXTURE_TYPE.ROUGHNESS*/],
        })
    }
}