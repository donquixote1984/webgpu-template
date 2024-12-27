//__WEBGPU_CONTEXT__ = {};

export const InitWebGPU = async () => {
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!device) {
        console.log('need a browser that supports WebGPU');
        return {};
    }

  // Get a WebGPU context from the canvas and configure it
    const canvas = document.querySelector('canvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const context = canvas.getContext('webgpu');
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format: presentationFormat,
    });
    const queue = device.queue;

    const screenDepthTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    const wgpucontext = {device, queue, format: presentationFormat, context, depth: screenDepthTexture};
    window.__WGPU_CONTEXT__ = wgpucontext;


    return wgpucontext;
}
