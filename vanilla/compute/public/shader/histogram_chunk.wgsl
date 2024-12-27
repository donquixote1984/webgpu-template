
const chunkSize = 16;
@group(0) @binding(0) var<storage, read_write> chunks: array<array<u32, chunkSize * chunkSize>>;
@group(1) @binding(0) var uTexture: texture_2d<f32>;

const kSRGBLuminanceFactors = vec3f(0.2126, 0.7152, 0.0722);
fn srgbLuminance(color: vec3f) -> f32 {
    return saturate(dot(color, kSRGBLuminanceFactors));
}



var<workgroup> bins: array<atomic<u32>, chunkSize * chunkSize>;  // shared memory 

@compute @workgroup_size(chunkSize, chunkSize)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3u,
    @builtin(workgroup_id) workgroup_id: vec3u,
    @builtin(local_invocation_id) local_invocation_id: vec3u
) {
     let size = textureDimensions(uTexture, 0);
     let position = global_invocation_id.xy;  // global_invocation_id can go from (0,0) to (imageW, imageH) because [work_group_size * dispatchWorkGroups == ImageSize]

    if (all(position < size)) {
       
        let numOfBins = f32(chunkSize * chunkSize);
        let lastBinIndex = u32(numOfBins - 1);

        
        let color = textureLoad(uTexture, position, 0);
        let v = srgbLuminance(color.rgb);
        let bin = min(u32(v * numOfBins), lastBinIndex);
        //bins[bin]+=1;
        atomicAdd(&bins[bin], 1u);
    }

    workgroupBarrier();

    //
    /**
    chunk_no (dispatch groups 4x4)
    chunk1 (0,0)| chunk2(0,1) | chunk3(0,2) | chunk 4(0,3)
    chunk5 (1,0)| chunk6(1,1) | chunk7(1,2) | chunk 8(1,3)
    ....
    chunkN-7 | chunkN-6 | chunkN-5 | chunkN-4
    chunkN-3 | chunkN-2 | chunkN-1 | chunkN
    


    // 1. how many chunks they have ? x * y -> dispatch_groups(x, y)
       2. how to get the x, y value ?  work_group_id.xy
       3. how to convert x, y into linear array index?    x*N + y or y * N + x(not sure the orientation)
       4. what is N ?   Math.ceil(imageWidth / chunkSize) => (size.x + chunkSize-1) / chunkSize;
       5. what is the orientation?  y * N + x; // i don't know, just try and remember.
       6. so what is chunk_index ? 
    **/

    let n: u32 = (size.x + chunkSize- 1) / chunkSize;
    var chunk_index: u32 = workgroup_id.y * n + workgroup_id.x;
    /**
    1. bin_dictionary range ? 0, 1,2 3,4,.....255, (16 x 16)
    2. how to calculate current bin_dictionary:  local_invocation_id: (0,0) => (15, 15);
    */
    var bin_dictionary: u32 = local_invocation_id.y * chunkSize+ local_invocation_id.x;

    /**
    any sharing value should use atomicXXX operations
    */
    chunks[chunk_index][bin_dictionary] = atomicLoad(&bins[bin_dictionary]);
}
