import Module from './objloader'
function writeBufferIntoWasmMemory(heap8, address, data) {
    // array view input
    // might be a sub-view, so use byteOffset
    if (ArrayBuffer.isView(data)) {
      let {byteOffset, byteLength} = data;
      heap8.set(new Uint8Array(data.buffer).subarray(byteOffset, byteOffset + byteLength), address);
    // normal arraybuffer input
    } else {
      heap8.set(new Uint8Array(data), address);
    }
};

export const loadObj332 = async (objurl) => {
    return await loadObjStrides(objurl, 4);
}
export const loadObj33 = async (objurl) => {
    return await loadObjStrides(objurl, 2);
}
export const loadObj3 = async (objurl) => {
    return await loadObjStrides(objurl, 1);
}

export const loadObjStrides = async (objurl, mode = 1) => {
    const res = await fetch(objurl);
    const obj = await res.blob();
    const wasm = await Module();
    const data = new Uint8Array(await obj.arrayBuffer());
    let addr = wasm._malloc(data.byteLength)
    writeBufferIntoWasmMemory(wasm.HEAP8, addr, data);

    let memAddr = wasm._loadObjStrides(addr, data.byteLength, mode);
    wasm._free(addr);

      // read MemoryAddr struct from heap
    /**
     * 
     * struct MemoryAddr {
        std::vector<float>* vertices;   1
        std::vector<unsigned int>* indices;    1
        int stride, 4
        int vertexCount,  4
        int indicesCount, 4

        };
     *  memAddr =  &MemoryAddr
     */
    let memoryAddrStructSize = 14;
    let memoryAddrView = wasm.HEAPU32.subarray(memAddr >> 2, (memAddr >> 2) + memoryAddrStructSize);
    let lengths = memoryAddrView.subarray(2, 2 + 12); // to know how much data we have to reflect per-member
    let offset = 0x0;
    let verticesPtr = wasm.HEAPU32[(memoryAddrView[offset] >> 2)]; // deref
    const stride = lengths[0];
    const vertexCount = lengths[1];
    const indicesCount = lengths[2];

    let vertices = wasm.HEAPF32.subarray(
        (verticesPtr >> 2),
        (verticesPtr >> 2) + stride * vertexCount
    );

    offset += 1;

    let indicesPtr = wasm.HEAPU32[(memoryAddrView[offset] >> 2)]; // 
    let indices = wasm.HEAPU32.subarray(
        (indicesPtr >> 2),
        (indicesPtr >> 2) + indicesCount 
    );

    let output = {
        vertices: new Float32Array(vertices),
        indices: new Uint32Array(indices),
        stride,
        vertexCount,
        indicesCount,
    }

    wasm._freeMemoryStrideAddr(memAddr);

    return output;

}

export const loadObj = async (objurl) => {
    const res = await fetch(objurl);
    const obj = await res.blob();
    const wasm = await Module();
    const data = new Uint8Array(await obj.arrayBuffer());
    let addr = wasm._malloc(data.byteLength)
    writeBufferIntoWasmMemory(wasm.HEAP8, addr, data);

    let memAddr = wasm._loadObj(addr, data.byteLength);
    wasm._free(addr); // free input char *

    // read MemoryAddr struct from heap
    /**
     * 
     * struct MemoryAddr {
        std::vector<Vector3>* vertices;   1
        std::vector<Vector3>* normals;    1
        std::vector<Vector2>* uvs;        1
        std::vector<unsigned int>* indices; 1
        int lengths[4];                   12
        };
     *  memAddr =  &MemoryAddr
     */
    let memoryAddrStructSize = 16;
    let memoryAddrView = wasm.HEAPU32.subarray(memAddr >> 2, (memAddr >> 2) + memoryAddrStructSize);
    let lengths = memoryAddrView.subarray(4, 4 + 4); // to know how much data we have to reflect per-member
    let offset = 0x0;

    let verticesPtr = wasm.HEAPU32[(memoryAddrView[offset] >> 2)]; // deref
    let verticesView = wasm.HEAPF32.subarray(
        (verticesPtr >> 2),
        (verticesPtr >> 2) + lengths[offset]
    );

    offset++;
    // create view on normals
    let normalsPtr = wasm.HEAPU32[(memoryAddrView[offset] >> 2)]; // deref
    let normalsView = wasm.HEAPF32.subarray(
        (normalsPtr >> 2),
        (normalsPtr >> 2) + lengths[offset]
    );

    offset++;

    // create view on uvs
    let uvsPtr = wasm.HEAPU32[(memoryAddrView[offset] >> 2)]; // deref
    let uvsView = wasm.HEAPF32.subarray(
        (uvsPtr >> 2),
        (uvsPtr >> 2) + lengths[offset]
    );

    offset++;

    // create view on indices
    let indicesPtr = wasm.HEAPU32[(memoryAddrView[offset] >> 2)]; // deref
    let indicesView = wasm.HEAPU32.subarray(
        (indicesPtr >> 2),
        (indicesPtr >> 2) + lengths[offset]
    );

    offset++;

    let out = {
        vertices: new Float32Array(verticesView),
        normals: new Float32Array(normalsView),
        uvs: new Float32Array(uvsView),
        indices: new Uint32Array(indicesView)
    };
    wasm._freeMemoryAddr(memAddr);
    return out;
}