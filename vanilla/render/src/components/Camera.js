import {mat4} from 'wgpu-matrix';

export default class Camera {
    position = null;
    up = [0, 1, 0];
    fov = 60 * Math.PI / 180;  // 60 degrees in radians
    aspect = 1;
    zNear  = 0.1;
    zFar   = 100;
    target = [0, 0, 0];

    projectionMatrix = null;
    viewMatrix = null;
    invProjectionMatrix = null;
    invViewMatrix = null;
    device = window.__WGPU_CONTEXT__.device;
    buffer = null;
    constructor(initPos) {
        this.position = initPos;
        this.projectionMatrix = mat4.perspective(this.fov, this.aspect, this.zNear, this.zFar); 
        this.invProjectionMatrix = mat4.inverse(this.projectionMatrix);
        this.buffer = this.device.createBuffer({
            size: 4 * 4 * 16, // 4 matrix  , with 4 * 16 each size,  view | projection | inverseview | inverseprojection -> wgsl does not have inverse()
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    calcMatrices() {
        this.viewMatrix = mat4.lookAt(this.position, this.target, this.up);
        this.invViewMatrix = mat4.inverse(this.viewMatrix);
    }
    update() {
        this.calcMatrices();
        const bufferData = new Float32Array([
            ...this.viewMatrix,
            ...this.projectionMatrix,
            ...this.invViewMatrix,
            ...this.invProjectionMatrix,
        ]);
        this.device.queue.writeBuffer(this.buffer, 0, bufferData);
    }

    getBuffer() {
        return this.buffer;
    }
}