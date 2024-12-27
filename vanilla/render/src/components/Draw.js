import Sampler from "./Sampler";

export const draw = ({pipeline, vertex}) => {
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

    if (pipeline.hasBinding()) {
        const bindGroup = pipeline.uniformBindGroup;
        pass.setBindGroup(0, bindGroup.nativeBindGroup);
    }
    if (pipeline.hasSelfTexture()) {
        pass.setBindGroup(1, pipeline.textureBindGroup.nativeBindGroup);
        pass.setBindGroup(2, Sampler.getBindGroup(pipeline.pipeline.getBindGroupLayout(2)));
    }

    const {vertexBuffer, indexBuffer} = vertex.getBuffer();
    pass.setPipeline(pipeline.pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    if (vertex.indexed) {
        pass.setIndexBuffer(indexBuffer, 'uint32');
        pass.drawIndexed(vertex.numOfPoints, 1);
    } else {
        pass.draw(vertex.numOfPoints);
    }
    pass.end();
    device.queue.submit([encoder.finish()]);
    //pass.draw(pointsNumber);
    //pass.end();
    //device.queue.submit([encoder.finish()]);
    //return {pass, encoder }
}