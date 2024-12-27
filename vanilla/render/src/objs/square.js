/*
x, y, u, v

1, 1, 1, 1
1, 0, 1, 0,
*/

export const squareData = new Float32Array([
   -0.8, -0.8, // Triangle 1 
   0.8, -0.8,
   0.8,  0.8,

  -0.8, -0.8, // Triangle 2 
   0.8,  0.8,
  -0.8,  0.8,
])

export const canvasData = new Float32Array([
  1.0,  1.0, 1.0, 0.0,
  1.0, -1.0, 1.0, 1.0,
  -1.0, -1.0, 0.0, 1.0, 
  1.0,  1.0, 1.0, 0.0,
  -1.0, -1.0, 0.0, 1.0,
  -1.0,  1.0, 0.0, 0.0,
])
