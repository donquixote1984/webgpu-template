struct Vertex {
    @location(0) position: vec3f, 
    @location(1) normal: vec3f,
};

struct VertexOutput {
   @builtin(position) position: vec4f,
   @location(0) fragPos: vec4f,
   @location(1) normal: vec4f,
   @location(2) uv: vec2f,
};

struct ViewProjection
{
	view: mat4x4f,
	projection: mat4x4f,
    invview: mat4x4f,
    invprojection: mat4x4f,
};

@group(0) @binding(0) var<uniform> uViewProjection: ViewProjection;

@vertex
fn vs(vertex: Vertex) -> VertexOutput {
  var position =  uViewProjection.projection * uViewProjection.view  * vec4f(vertex.position, 1.0);
  var normal = vec4f(vertex.normal, 0.0);
  var output : VertexOutput;
  output.position = position;
  output.fragPos = vec4f(vertex.position, 1.0f);
  output.normal = normal;
  //var position = vertex.position;
  return output;
}

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
    var normal = in.normal.xyz;
    // fake light. 
    var l = max(0, dot(normal, normalize(vec3f(1,1,1))));
    return vec4f(l, l, l, 1);
  //return vec4f(uViewProjection.projection[1][0], uViewProjection.projection[1][1], uViewProjection.projection[1][2], uViewProjection.projection[1][3]);
}