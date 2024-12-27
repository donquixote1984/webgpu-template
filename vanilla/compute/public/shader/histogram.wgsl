@group(0) @binding(0) var<storage, read_write> bins: array<atomic<u32>>;
@group(1) @binding(0) var uTexture: texture_2d<f32>;

const kSRGBLuminanceFactors = vec3f(0.2126, 0.7152, 0.0722);
fn srgbLuminance(color: vec3f) -> f32 {
    return saturate(dot(color, kSRGBLuminanceFactors));
}

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3u) {
    let numOfBins = f32(arrayLength(&bins));
    let lastBinIndex = u32(numOfBins - 1);
    let size = textureDimensions(uTexture, 0);

    let position = global_invocation_id.xy;
  
    let color = textureLoad(uTexture, position, 0);
    let v = srgbLuminance(color.rgb);
    let bin = min(u32(v * numOfBins), lastBinIndex);
    //bins[bin]+=1;
    atomicAdd(&bins[bin], 1u);
}
