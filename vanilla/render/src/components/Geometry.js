
import {mat4} from 'wgpu-matrix';
import Texture from './Texture';
import {TEXTURE_TYPE} from './constants';

export class Transform {
    translate = [0, 0, 0];
    rotate = [0, 0, 0];
    scale = [1,1,1];
}


const TEXTURE_SEQ = [TEXTURE_TYPE.DIFFUSE, TEXTURE_TYPE.NORMAL, TEXTURE_TYPE.ROUGHNESS];
export default class Geometry {
    static count = 0;
    name = '';
    vertex = null;
    pipeline = null;
    model = mat4.identity(); // mat4
    transform = new Transform()

    textures = {}; // {'diffuse': new Texture(), 'normal': new Texture(), }
    textureBindGroup = null;
    device = __WGPU_CONTEXT__.device;
    frameTransform = (transform) => { return transform}
    constructor({vertex, pipeline}) {
        this.vertex = vertex;
        this.pipeline = pipeline;
        this.name = `Geometry${Geometry.count++}`;
    }

    translate(trans) {
        this.transform.translate = trans;
        //this.model = mat4.translate(this.model, this.transform.translate);
    }

    rotate(rot) {
        this.transform.rotate = rot;
        //this.model = mat4.rotateX(this.model, this.transform.rotate[0]);
        //this.model = mat4.rotateY(this.model, this.transform.rotate[1]);
        //this.model = mat4.rotateZ(this.model, this.transform.rotate[2]);
    }

    scale(sca) {
        this.transform.scale = sca;
        //this.model = mat4.scale(this.model, this.transform.scale);
    }

    /**
     * const transFunc = (prev) => {
     *  return next
     * }
     */
    calcMatrix() {
        let model = mat4.identity();
        model = mat4.scale(model, this.transform.scale);



        model = mat4.translate(model, this.transform.translate);
        model = mat4.rotateX(model, this.transform.rotate[0]);
        model = mat4.rotateY(model, this.transform.rotate[1]);
        model = mat4.rotateZ(model, this.transform.rotate[2]);
        return model;
    }
    setFrameTransform(transFunc) {
        this.frameTransform = transFunc.bind(this);
    }
    writeMatrixToBuffer(buffer, currentIndex = 0) {
        const trans = this.frameTransform(this.transform);
        this.rotate(trans.rotate);
        this.scale(trans.scale);
        this.translate(trans.translate);
        const model = this.calcMatrix();
        this.device.queue.writeBuffer(buffer, currentIndex * 256, model);
    }

    async addTexture(key, url) {
        const t = await Texture.create(url);
        this.textures[key] = t;
    }

    hasTextures() {
        return Object.keys(this.textures).length > 0;
    }
    getTextureBindGroup() {
        if (this.textureBindGroup) {
            return this.textureBindGroup;
        }

        const entries = TEXTURE_SEQ.map(t => this.textures[t]).filter(Boolean).map((texture, index) => {
            return {
                binding: index,
                resource: texture.nativeTexture.createView()
            }
        })
        //this.textures[TEXTURE_TYPE.DIFFUSE]
        this.textureBindGroup = this.device.createBindGroup({
            label: `${this.name} textureBindGroup`,
            entries,
            layout: this.pipeline.pipeline.getBindGroupLayout(1),
        })
        return this.textureBindGroup;
    }

}

