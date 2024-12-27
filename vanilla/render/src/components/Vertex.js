import { loadObj, loadObj33,loadObj332} from '../wasm/objloader';

export default class Vertex {
    vertexBuffer = null;
    indexBuffer = null;

    indexed = false;
    vertices = new Float32Array([]);
    indices = new Uint32Array([]);

    numOfPoints = 0;
    constructor({vertices, indices = [], numOfPoints}) {
        this.vertices = vertices;
        this.indices = indices;
        this.numOfPoints = numOfPoints;
        
        const device = window.__WGPU_CONTEXT__.device;
        const vertexBuffer = device.createBuffer({
            label: 'square',
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
        device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);
        this.vertexBuffer = vertexBuffer;

        if (indices.length > 0) {
            this.indexed = true;
            const indexBuffer = device.createBuffer({
                label: 'cubeIndex',
                size: indices.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            })

            device.queue.writeBuffer(indexBuffer, 0, indices);
            this.indexBuffer = indexBuffer;
        }
    }

    getBuffer() {
        return {
            vertexBuffer: this.vertexBuffer,
            indexBuffer: this.indexBuffer
        }
    }
    release() {
        this.vertexBuffer.destroy();
        this.indexBuffer.destroy();
    }

    static async fromObj33(objUrl) {
        /**
        vertices: new Float32Array(vertices),
        stride,
        vertexCount,
        indicesCount,
        */
        const {vertices, indices, stride, vertexCount, indicesCount} = await loadObj33(objUrl); // Float32Array
        const v = new Vertex({vertices, indices, numOfPoints: vertexCount});
        return v;
    }


    static async fromObj332(objUrl) {
        /**
        vertices: new Float32Array(vertices),
        stride,
        vertexCount,
        indicesCount,
        */
        const {vertices, indices, stride, vertexCount, indicesCount} = await loadObj332(objUrl); // Float32Array
        const v = new Vertex({vertices, indices, numOfPoints: vertexCount});
        return v;
    }
}