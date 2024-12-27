
export const BufferLayout2DSimple = { // only vertex (x, y)
    arrayStride: 2 * 4, // 2 floats (x, y),  4 byte per each.
    attributes: [
        {
            shaderLocation: 0,
            offset: 0,
            format: 'float32x2'
        }
    ]
}

export const BufferLayout2DUV = { // vertex(x, y, u, v)
    arrayStride: 4 * 4, // 2 floats (x, y),  4 byte per each.
    attributes: [
        {
            shaderLocation: 0,
            offset: 0,
            format: 'float32x2'
        },
        {
            shaderLocation: 1,
            offset: 2 * 4,
            format: 'float32x2'
        }
    ]
}

export const BufferLayout3DSimple = { // only vertex (x, y, z)
    arrayStride: 3 * 4, // 3 floats (x, y),  4 byte per each.
    attributes: [
        {
            shaderLocation: 0,
            offset: 0,
            format: 'float32x3'
        }
    ]
}
export const BufferLayout3D33 = {
    arrayStride: 6 * 4, // 3 floats (x, y),  4 byte per each.
    attributes: [
        {
            shaderLocation: 0,
            offset: 0,
            format: 'float32x3'
        },
        {
            shaderLocation: 1,
            offset: 3 * 4,
            format: 'float32x3'
        }
    ]
}

export const BufferLayout3D332 = {
    arrayStride: 8 * 4, 
    attributes: [
        {
            shaderLocation: 0,
            offset: 0,
            format: 'float32x3'
        },
        {
            shaderLocation: 1,
            offset: 3 * 4,
            format: 'float32x3'
        },
        {
            shaderLocation: 2,
            offset: 6 * 4,
            format: 'float32x2'
        }
    ]
}



export const BufferLayout3DUV = { // vertex (x, y, z, u , v)
    arrayStride: 5 * 4, // 5 floats (x, y),  4 byte per each.
    attributes: [
        {
            shaderLocation: 0,
            offset: 0,
            format: 'float32x3'
        }, {
            shaderLocation: 1,
            offset: 3 * 4, 
            format: 'float32x2'
        }
    ]
}


export default class Buffer {
    device = __WGPU_CONTEXT__.device;
    nativeBuffer = null;
    usage = null;
    size = 0;
    constructor({data, usage, size}) {
        this.usage = usage;
        this.size = size;
        this.nativeBuffer = this.device.createBuffer({
            size: this.size,
            usage,
        });

        if (data) {
            this.device.queue.writeBuffer(this.nativeBuffer, 0, data);
        }
    }
    static create({data, usage, size}) {
        const b = new Buffer({data, usage, size, });
        return b;
    }
}
