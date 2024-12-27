export default class Sampler {
    static nativeSampler = null;
    static nativeBindGroup = null;
    constructor() {
    }

    static getInstance() {
        if (Sampler.nativeSampler) {
            return Sampler.nativeSampler;
        }
        const device = window.__WGPU_CONTEXT__.device;
        Sampler.nativeSampler = device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear'
        });
        return Sampler.nativeSampler;
    }

    static getBindGroup(bindGroupLayout) {
        const device = window.__WGPU_CONTEXT__.device;
        if (Sampler.nativeBindGroup) {
            return Sampler.nativeBindGroup;
        }
        let layout = bindGroupLayout;
        if (!bindGroupLayout) {
            layout = device.createBindGroupLayout({entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {
                    type: "filtering",
                },
            }]})
        }
        
        Sampler.nativeBindGroup = device.createBindGroup({
            layout,
            entries: [{
                binding: 0,
                resource: Sampler.getInstance()
            }]
        })
        return Sampler.nativeBindGroup;

    }
}