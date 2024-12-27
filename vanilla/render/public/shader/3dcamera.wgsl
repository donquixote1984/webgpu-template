struct Vertex {
    @location(0) position: vec3f, 
};

struct VertexOutput {
   @builtin(position) position: vec4f,
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
fn vs(vertex: Vertex) -> @builtin(position) vec4f {
  var position =  uViewProjection.projection * uViewProjection.view  * vec4f(vertex.position, 1.0);
  //var position = vertex.position;
  return position;
}

@fragment
fn fs() -> @location(0) vec4f {
  return vec4f(1, 0, 0, 1);

  //return vec4f(uViewProjection.projection[1][0], uViewProjection.projection[1][1], uViewProjection.projection[1][2], uViewProjection.projection[1][3]);
}