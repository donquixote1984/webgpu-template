import Cmd from "./Cmd";
export const compute = async ({pipeline, dispatchWorkGroups=[1,1,1], reader = null}) => {
   
    const pass = Cmd.encoder.beginComputePass({
        label: 'doubling compute pass',
    });

    pass.setPipeline(pipeline.nativePipeline);
    pass.setBindGroup(0, pipeline.getStorageBindGroup());
    if (pipeline.hasTexture()) {
        pass.setBindGroup(1, pipeline.getTextureBindGroup());
    }
    pass.dispatchWorkgroups(dispatchWorkGroups[0], dispatchWorkGroups[1]);
    pass.end();

    if (reader) {
        //encoder.copyBufferToBuffer(pipeline.getTargetBuffer().nativeBuffer, 0, /**/, 0, pipeline.getTargetBuffer().size);
        reader.copyBuffer(encoder, pipeline.getTargetBuffer());
    }
}