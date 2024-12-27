struct Vertex {
    @location(0) position: vec2f, 
    @location(1) uv: vec2f
};

@group(0) @binding(0) var<uniform> buffer: f32;
@group(1) @binding(0) var myTexture : texture_2d<f32>;
@group(2) @binding(0) var mySampler : sampler;

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vert_main(vertex: Vertex) -> VertexOutput {
  var output : VertexOutput;
  var key = buffer;
  output.position= vec4(vertex.position.x, vertex.position.y, 0.0, 1.0);
  output.uv= vertex.uv;
  return output;
}

@fragment
fn frag_main(@location(0) uv: vec2f) -> @location(0) vec4f {
    var color = textureSample(myTexture, mySampler, uv);
    if (uv.x * 100 % 20.0f < 10.0f && uv.y * 100 % 20.0f < 10.0f)  {
         return vec4f(1.0f, 0.0f, 0.0f, 1.0f);
    } 
    return color;
  
  //return vec4f(1.0, 0.0, 0.0, 1.0);
}
