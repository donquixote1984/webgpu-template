export const cubeData = new Float32Array([
    -1.0,  1.0, 1.0,     
    1.0,   1.0, 1.0,     
    -1.0, -1.0, 1.0,     
    1.0,  -1.0, 1.0,     
    -1.0, 1.0,  -1.0,    
    1.0,  1.0,  -1.0,
    -1.0, -1.0, -1.0, 
    1.0,  -1.0, -1.0,
])

export const cubeIndex = new Uint32Array([
    0, 1, 2,
    1, 2, 3, // front
    
    4, 5, 6,
    5, 6, 7,  // back

    0, 2, 6, 
    0, 4, 6,  // left

    1, 3, 5, 
    3, 7, 5,  // right

    0, 1, 5, 
    0, 4, 5,  // top

    2, 3, 7, 
    2, 6, 7,  // bottom
]);

export const createCubeBuffer = () => {
    const device = window.__WGPU_CONTEXT__.device;
    const vertexBuffer = device.createBuffer({
        label: 'cube',
        size: cubeData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    })
    const indexBuffer = device.createBuffer({
        label: 'cubeIndex',
        size: cubeIndex.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    })

    device.queue.writeBuffer(vertexBuffer, 0, cubeData);
    device.queue.writeBuffer(indexBuffer, 0, cubeIndex);
    return {vertexBuffer, indexBuffer};
}