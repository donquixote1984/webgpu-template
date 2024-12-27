struct Vertex {
    @location(0) position: vec2f, 
};

struct VertexOutput {
   @builtin(position) position: vec4f,
}

@vertex
fn vs(vertex: Vertex) -> @builtin(position) vec4f {
  var position = vertex.position;
  return vec4f(position.x, position.y, 0.0, 1.0);
}

@fragment
fn fs() -> @location(0) vec4f {
  return vec4f(1, 0, 0, 1);
}