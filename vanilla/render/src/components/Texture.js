import { generateMips } from "./MipmapGenerator";
export default class Texture {
    path = null;
    nativeTexture = null;
    device = __WGPU_CONTEXT__.device;
    constructor(bitmap) {
        const {width, height} = bitmap;
        const mipLevels = 1 + Math.log2(Math.max(width, height)) | 0;
        this.nativeTexture = this.device.createTexture({
            size: [width, height, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
            mipLevelCount: mipLevels,
        });

        this.device.queue.copyExternalImageToTexture(
            {source: bitmap},
            {texture: this.nativeTexture},
            [bitmap.width, bitmap.height]
        );

        generateMips(this.device, this.nativeTexture);
    }

    static async create(path) {
        const res = await fetch(path);
        const raw = await res.blob();
        const bitmap = await createImageBitmap(raw, { imageOrientation: "flipY" });

        return new Texture(bitmap);
    }
}