const chunkSize = 16;
@group(0) @binding(0) var<storage, read_write> chunks: array<array<u32, chunkSize * chunkSize>>;
@compute @workgroup_size(chunkSize * chunkSize, 1, 1)
fn compute(@builtin(local_invocation_id) local_invocation_id: vec3u) {
    // local_invocation_id from (0, 0) -> (chunkSize, 0)
    var sum = u32(0);
    let numChunks = arrayLength(&chunks);
    for (var i = 0u; i < numChunks; i++) {
          sum += chunks[i][local_invocation_id.x];
    }
    // put numbers to 1st 
    chunks[0][local_invocation_id.x] = sum;
}

