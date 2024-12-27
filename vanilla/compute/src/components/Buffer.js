export default class Buffer {
    device = __WGPU_CONTEXT__.device;
    nativeBuffer = null;
    usage = null;
    isTarget = false;
    size = 0;
    constructor({data, usage, size, isTarget}) {
        this.usage = usage;
        this.size = data ? data.byteLength : size;
        this.isTarget = isTarget;
        this.nativeBuffer = this.device.createBuffer({
            size: this.size,
            usage,
        });

        if (data) {
            this.device.queue.writeBuffer(this.nativeBuffer, 0, data);
        }
    }
    static create({data, usage, size, isTarget}) {
        const b = new Buffer({data, usage, size, isTarget});
        return b;
    }
}