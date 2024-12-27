
const chunkSize = 16;
@group(0) @binding(0) var<storage, read> iteration: i32;
@group(1) @binding(0) var uTexture: texture_2d<f32>;
@group(1) @binding(1) var uTextureOut: texture_storage_2d<rgba8unorm, write>;

fn blur(position:vec2u)->vec4f {
    var color: vec4f = vec4f(0.0f, 0.0f, 0.0f, 0.0f);
    for (var i = -iteration; i < iteration ;i ++) {
        for (var j = -iteration; j < iteration ;j ++) {
            var offset = vec2i(position) + vec2i(i, j);
            color += textureLoad(uTexture, offset, 0);
        }
    }
    color /= f32(iteration * iteration * 4);
    return color;
}

@compute @workgroup_size(chunkSize, chunkSize)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3u,
    @builtin(workgroup_id) workgroup_id: vec3u,
    @builtin(local_invocation_id) local_invocation_id: vec3u
) {
     let size = textureDimensions(uTexture, 0);
     let position = global_invocation_id.xy;  // global_invocation_id can go from (0,0) to (imageW, imageH) because [work_group_size * dispatchWorkGroups == ImageSize]
    if (all(position < size)) {
       let color: vec4f = blur(position);
       textureStore(uTextureOut, position, color);
    }
}
