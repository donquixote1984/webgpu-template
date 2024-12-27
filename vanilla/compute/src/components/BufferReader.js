export default class BufferReader {

    stageNativeBuffer = null;
    device = __WGPU_CONTEXT__.device;
    size = 0;
    constructor(size = 0) {
        this.size = size;
    }

    copyBuffer(encoder, buffer) {
        this.stageNativeBuffer = this.device.createBuffer({
            size: this.size || buffer.size,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        })
        encoder.copyBufferToBuffer(buffer.nativeBuffer, 0, /**/this.stageNativeBuffer, 0, this.size || buffer.size);
    }

    async output(type=Float32Array) {
        await this.stageNativeBuffer.mapAsync(GPUMapMode.READ);
        const arrayBuffer = this.stageNativeBuffer.getMappedRange();
        let t;
        if (type === Float32Array) {
            t = new Float32Array(arrayBuffer)
            console.log(t);
        }
        if (type === Uint32Array) {
            t = new Uint32Array(arrayBuffer)
            console.log(t);
        }

        return t;
    }

    unmap() {
        this.stageNativeBuffer.unmap();
    }
}