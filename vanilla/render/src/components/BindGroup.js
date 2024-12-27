import { BINDGROUPTYPE } from "./constants";

export class BindGroupEntry {
    index = 0;
    name = '';
    nativeBuffer = null;
    isDynamic = false;
    pipeline = null;
    size = 0;
    nativeTexture = null;
    nativeSampler = null;
    type = BINDGROUPTYPE.UNIFORM;
    constructor({index, name, nativeBuffer, isDynamic, pipeline, size, nativeSampler, nativeTexture }) {
        this.index = index;
        this.name = name;
        this.nativeBuffer = nativeBuffer;
        this.isDynamic = isDynamic;
        this.pipeline = pipeline;
        this.size = size;
        this.nativeSampler = nativeSampler;
        this.nativeTexture = nativeTexture;
        //this.type = type;

        if (this.nativeBuffer) {
            this.type = BINDGROUPTYPE.UNIFORM;
        }

        if (this.nativeSampler) {
            this.type = BINDGROUPTYPE.SAMPLER;
        }

        if (this.nativeTexture) {
            this.type = BINDGROUPTYPE.TEXTURE;
        }
    }
}
export default class BindGroup {
    nativeBindGroup = null;
    entries = [];
    groupIndex = 0;
    device = __WGPU_CONTEXT__.device;
    name = '';
    pipeline = null;
    autoLayout = true;
    constructor({name= '' , groupIndex = 0, pipeline, autoLayout = true}) {
        this.groupIndex = groupIndex;
        this.pipeline = pipeline;
        this.name = name;
        this.autoLayout = autoLayout;
    }
    getDynamicOffsets() {
        return this.entries.filter(m=>m.isDynamic).map(e => 256);
    }
    addBindGroupEntry({index = 0, name, nativeBuffer, nativeSampler, nativeTexture, isDynamic = false, size, type}) {
        const entry = new BindGroupEntry({index, name, nativeBuffer, isDynamic, size, nativeSampler, nativeTexture, type});
        this.entries.push(entry);
        if (isDynamic) {
            this.autoLayout = false; // if has dynamic, can not use autolayout.
        }
    }

    getLayoutDesc() {
        const entries = this.entries.map(e => {
            let layout = {
                binding: e.index,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            }
            let extra = {};
            if (e.type === BINDGROUPTYPE.UNIFORM) {
                extra = {
                    buffer: {
                        type: 'uniform',
                        hasDynamicOffset: e.isDynamic,
                        minBindingSize: e.size
                    }
                }
            } else if (e.type === BINDGROUPTYPE.TEXTURE) {
                extra = {
                    texture : {
                        sampleType: 'float',
                        viewDimension: '2d',
                        multisampled: false
                    }
                }
            } else if (e.type == BINDGROUPTYPE.SAMPLER) {
                extra = {
                    sampler: {
                        type: "filtering",
                    },
                }
            }
            return {...layout, ...extra};
        })
        return {entries}
    }

    createBindGroup() {
       const entries = this.entries.map(e => {
        let resource = {
        }

        if (e.type === BINDGROUPTYPE.UNIFORM) {
            resource = {
                buffer: e.nativeBuffer,
                size: e.size,
                offset: 0
            }
        }
        if (e.type === BINDGROUPTYPE.TEXTURE) {
            resource = e.nativeTexture.createView();
        }

        return  {
            label: e.name,
            binding: e.index,
            resource,
        }
       });
       let bindGroupLayout = this.pipeline.pipeline.getBindGroupLayout(this.groupIndex);
       if (!this.autoLayout) {
            bindGroupLayout = this.device.createBindGroupLayout(this.getLayoutDesc());
       }

       this.nativeBindGroup = this.device.createBindGroup({
            label: this.name,
            entries,
            layout: this.pipeline.pipeline.getBindGroupLayout(this.groupIndex),
        })
        return this.nativeBindGroup;
    }
}