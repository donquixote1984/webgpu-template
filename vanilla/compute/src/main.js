import {InitWebGPU} from './initiators';
import { basicProcedual } from './samples/basicprocedual';
import { PipelineBasic, PipelineCanvas, PipelineMatrix, PipelineHistogram, PipelineHistogramChunk, PipelineImageBlur} from './components/Pipeline';
import { compute } from './components/Compute';
import Buffer from './components/Buffer';
import BufferReader from './components/BufferReader';
import { outputHistogram } from './samples/histogram';
import { render } from './components/Render';
import Cmd from './components/Cmd';

const initBasic = async () => {
  await InitWebGPU();
  const pipeline = await PipelineBasic.create();
  await pipeline.ready();
  basicProcedual(pipeline);
}

const initMatrix = async () => {
  await InitWebGPU();
  const pipeline = await PipelineMatrix.create();

  const mat1 = new Float32Array([
    2 /* rows */, 4 /* columns */,
    1, 2, 3, 4,
    5, 6, 7, 8
  ]);
  const mat2 = new Float32Array([
    4 /* rows */, 2 /* columns */,
    1, 2,
    3, 4,
    5, 6,
    7, 8
  ])

  pipeline.addBuffer(Buffer.create({usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST , data: mat1}));

  pipeline.addBuffer(Buffer.create({usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST , data: mat2}));

  pipeline.addBuffer(Buffer.create({isTarget: true, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC, size: Float32Array.BYTES_PER_ELEMENT * (2 + mat1[0] * mat2[1])}))

  const reader = new BufferReader();
  await pipeline.ready();
  await compute({pipeline, reader});
  await reader.output();
}
const initHistogram = async () => {
  await InitWebGPU();
  const pipeline = await PipelineHistogram.create();
  const numOfBins = 256;
  const bins = new Float32Array(numOfBins).fill(0);
  pipeline.addBuffer(Buffer.create({data: bins, isTarget: true, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC }));
  const {width, height} = await pipeline.addTexture('/textures/cat.jpg');
  const reader = new BufferReader();

  await pipeline.ready();
  Cmd.start();
  await compute({pipeline, reader, dispatchWorkGroups: [width, height]});
  Cmd.submit();
  const t = await reader.output(Uint32Array);
  outputHistogram({histogram: t, numEntries: width * height});

  reader.unmap();
}
//initBasic();

const initHistogramChunk = async () => {
  await InitWebGPU();
  const pipeline = await PipelineHistogramChunk.create();
  const {width, height} = await pipeline.addTexture('/textures/cat.jpg');

  const chunkWidth = 16;
  const chunkHeight = 16;  // 256
  /**
   * 1 work group thread process: 16 x 16 pixel, 
   * and dispatch width/16, height/16 work_groups
   * 
  */

  const chunkSize = chunkWidth * chunkHeight;
  const numOfChunksW = Math.ceil(width / chunkWidth);
  const numOfChunkH = Math.ceil(height / chunkHeight);
  const chunkBuffer = Buffer.create({
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    isTarget: true,
    size:  width * height * 4
  });

  pipeline.addBuffer(chunkBuffer);

  await pipeline.ready();
  await compute({pipeline, dispatchWorkGroups: [numOfChunksW, numOfChunkH]});

  const sumPipeline = await PipelineHistogramChunk.createSum();
  sumPipeline.addBuffer(chunkBuffer);
  await sumPipeline.ready();
  const reader = new BufferReader(16 * 16 * 4);
  Cmd.start();
  await compute({pipeline: sumPipeline, reader, dispatchWorkGroups: [1,1]});
  Cmd.submit();
  const t = await reader.output(Uint32Array);
  outputHistogram({histogram: t, numEntries: width * height});
  reader.unmap();
};

const initImageBlur = async () => {
  await InitWebGPU();
  const pipeline = await PipelineImageBlur.create();
  const {width, height} = await pipeline.addTexture('/textures/cat.jpg');
  const chunkWidth = 16;
  const chunkHeight = 16;  // 256

  pipeline.addBuffer(Buffer.create({
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    data:  new Int32Array([10]),
  }))

  const {texture} = pipeline.addEmptyTexture(width, height); // output texture
  await pipeline.ready();
  
  const renderPipeline = await PipelineCanvas.create();
  await renderPipeline.renderReady();

  Cmd.start();
  await compute({pipeline: pipeline, dispatchWorkGroups:[Math.ceil(width / chunkWidth), Math.ceil(height / chunkHeight)]});
  await render({pipeline: renderPipeline, texture: texture.nativeTexture});
  Cmd.submit();
}

initImageBlur();

//await initMatrix();
//await initHistogram();
//initHistogramChunk();


