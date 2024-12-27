export const basicProcedual = async (pipeline) => {
    const {device} = __WGPU_CONTEXT__;
    const input = new Float32Array([1, 3, 5]);
    const workBuffer = device.createBuffer({
        label: 'workbuffer',
        size: input.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(workBuffer, 0, input);

    const resultBuffer = device.createBuffer({
        label: 'resultbuffer',
        size: input.byteLength,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    const bindGroup = device.createBindGroup({
        label: 'bind group for work buffer',
        layout: pipeline.nativePipeline.getBindGroupLayout(0),
        entries: [{
            binding: 0,
            resource: {
                buffer: workBuffer
            }
        }]
    })

    const encoder = device.createCommandEncoder({
        label: 'doubling encoder',
    });
    const pass = encoder.beginComputePass({
        label: 'doubling compute pass',
    });

    pass.setPipeline(pipeline.nativePipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(input.length);
    pass.end();

    encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);

    await resultBuffer.mapAsync(GPUMapMode.READ);

    const result = new Float32Array(resultBuffer.getMappedRange().slice());
    resultBuffer.unmap();
    console.log('input', input);
    console.log('result', result);
}