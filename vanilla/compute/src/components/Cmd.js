export default class Cmd {
    static encoder = null;
    static start() {
        Cmd.encoder = __WGPU_CONTEXT__.device.createCommandEncoder({
            label: 'encoder',
        });
    }

    static submit() {
        __WGPU_CONTEXT__.device.queue.submit([Cmd.encoder.finish()]);
    }
}