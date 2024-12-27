struct Matrix {
    size: vec2f,
    numbers: array<f32>,
};
fn getCellValue(coord: vec2u, cellPerColumn: u32)->u32 {
    return coord.x * cellPerColumn + coord.y;
}
@group(0) @binding(0) var<storage, read> firstMatrix: Matrix;
@group(0) @binding(1) var<storage, read> secondMatrix: Matrix;
@group(0) @binding(2) var<storage, read_write> resultMatrix: Matrix;

@compute @workgroup_size(8,8)
fn main(@builtin(global_invocation_id) global_id: vec3u) {
    if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >=u32(secondMatrix.size.y)) {
        return;
    }

    resultMatrix.size = vec2f(firstMatrix.size.x, secondMatrix.size.y);
    //global_id.x

    var resultCell: vec2u = vec2u(global_id.x, global_id.y);
    var result: f32 = 0.0f;
    for (var i: u32 = 0; i < u32(firstMatrix.size.y); i++) {
        var a: u32 = i + resultCell.x * u32(firstMatrix.size.y);
        var b: u32 = resultCell.y + i * u32(secondMatrix.size.y);
        result += firstMatrix.numbers[a] * secondMatrix.numbers[b];
    }

    resultMatrix.numbers[resultCell.x * u32(firstMatrix.size.x) + u32(resultCell.y)] = result;
}