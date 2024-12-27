export default class Texture {
    path = null;
    nativeTexture = null;
    device = __WGPU_CONTEXT__.device;
    width = 0;
    height = 0;
    constructor({bitmap, width, height}) {
        if (bitmap) {
            const {width, height} = bitmap;
            this.width = width;
            this.height = height;
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
        } else {
            // create empty texture for output to canvas.
            this.nativeTexture = this.device.createTexture({
                size: [width, height, 1],
                format: 'rgba8unorm',
                usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING,
            });
        }
        
        //generateMips(this.device, this.nativeTexture);
    }

    static async load(path) {
        const res = await fetch(path);
        const raw = await res.blob();
        const bitmap = await createImageBitmap(raw);
        return new Texture({bitmap});
    }

    static create(width, height) {
        return new Texture({width, height});
    }
}