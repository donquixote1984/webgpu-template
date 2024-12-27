import { DEFAULT_MODEL_BUFFER_SIZE } from "./constants";
import Sampler from "./Sampler";

export default class Scene {

    camera = null;
    geometries = [];

    device = __WGPU_CONTEXT__.device;
    modelBuffer = null;
    constructor() {
        // create model buffer.
        this.modelBuffer = this.device.createBuffer({
            label: 'model',
            size: DEFAULT_MODEL_BUFFER_SIZE,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
    }

    release() {
        this.modelBuffer.destroy();
        this.geometries.forEach(g => {
            g.vertex.release();
        })
    }
    addCamera(cam) {
        this.camera = cam;
    }

    addGeometry(geometry) {
        this.geometries.push(geometry);
    }

    render() {
        const {device, context, depth}= window.__WGPU_CONTEXT__;
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
               view: context.getCurrentTexture().createView(),
               loadOp: "clear",
               storeOp: "store",
               clearValue: [0.5, 0.5, 0.5, 1.0],
            }],
            depthStencilAttachment: {
                view: depth.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
              },
        });


        this.geometries.forEach((g, index) => {

            g.writeMatrixToBuffer(this.modelBuffer, index);
            if (g.pipeline.hasBinding()) {
                const bindGroup = g.pipeline.uniformBindGroup;
                    // index 0 => uniformbindgroup
                    // index 1=> textureBindGroup
                    // index 2 => samplerBindGroup

                    // setBindGroup(index, bindGroup, dynamicOffsets)
                pass.setBindGroup(0., bindGroup.nativeBindGroup, bindGroup.getDynamicOffsets().map(f => f * index));
            }

            if (g.pipeline.hasTextureBinding()) {
                pass.setBindGroup(1, g.getTextureBindGroup());
                pass.setBindGroup(2, Sampler.getBindGroup(g.pipeline.pipeline.getBindGroupLayout(2)));
            }
            pass.setPipeline(g.pipeline.pipeline);
            const {vertexBuffer, indexBuffer} = g.vertex.getBuffer();
            pass.setVertexBuffer(0, vertexBuffer);
            if (g.vertex.indexed) {
                pass.setIndexBuffer(indexBuffer, 'uint32');
                pass.drawIndexed(g.vertex.numOfPoints, 1);
            } else {
                pass.draw(vertex.numOfPoints);
            }
        })

        pass.end();
        
        device.queue.submit([encoder.finish()]);

    }
    renderFrame() {
        this.render();
        requestAnimationFrame(()=>this.renderFrame())
    }

    getModelBuffer() {
        return this.modelBuffer;
    }

}