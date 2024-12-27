import Cmd from "./Cmd";
import { PipelineCanvas } from "./Pipeline";

export const render = async ({pipeline, texture}) => {
    const {device, context} = __WGPU_CONTEXT__;
    const pass = Cmd.encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: [0, 0, 0, 1],
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
    });
   
    pass.setPipeline(pipeline.nativePipeline);
    const bindGroup = PipelineCanvas.createBindGroup({pipeline: pipeline.nativePipeline, texture});
    pass.setBindGroup(0, bindGroup);
    pass.draw(6);
    pass.end();
}