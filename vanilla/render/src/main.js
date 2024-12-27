import './style.css'
import {InitWebGPU} from './initiators/index';
import Vertex from './components/Vertex';
import Buffer from './components/Buffer';
import { Pipeline2DSimple, PipelineCanvas, Pipeline3D33, Pipeline3DCamera, Pipeline3DSimple, Pipeline3DMultiple, Pipeline3DMultipleTextured} from './components/Pipeline';
import { squareData, canvasData} from './objs/square';
import { cubeData , cubeIndex} from './objs/cube';
import {draw } from './components/Draw';
import Camera from './components/Camera';
import  Geometry from './components/Geometry';
import Scene from './components/Scene';
import { BINDGROUPTYPE, TEXTURE_TYPE} from './components/constants';
import Texture from './components/Texture';



const initScene2D = async () => {
   await InitWebGPU();
   const pipeline = await Pipeline2DSimple.create();
   const vertex = new Vertex({vertices: squareData, numOfPoints: 6});

   await pipeline.ready();
   draw({
    pipeline,
    vertex,
   });
}
const initSceneCanvas = async () => {
  await InitWebGPU();
  const pipeline = await PipelineCanvas.create();;
  const vertex = new Vertex({vertices: canvasData, numOfPoints: 6});
  const buffer = Buffer.create({data: new Float32Array(1.0), size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST})
  await pipeline.addTexture('/textures/sample.jpg');
  
  pipeline.addUniformBindGroup({
    buffer: buffer.nativeBuffer,
    size: 4,
  });
  
  await pipeline.ready();
  draw({
    pipeline,
    vertex,
  })
}

const initScene3D = async () => {
  await InitWebGPU();
  const pipeline = await Pipeline3DSimple.create();
  const vertex = new Vertex({vertices: cubeData, indices: cubeIndex, numOfPoints: 8});

  await pipeline.ready();
  draw({
    pipeline,
    vertex
  })
}

const initScene3DWithCamera = async() => {
  await InitWebGPU();
 
  const pipeline = await Pipeline3DCamera.create();
  const vertex = new Vertex({vertices: cubeData, indices: cubeIndex, numOfPoints: 36});

  const camera = new Camera([0, 2, 5]);

  const viewProjectionBuffer = camera.getBuffer();
  camera.update();
  pipeline.addUniformBindGroup({
    buffer: viewProjectionBuffer // by default it is group0 bind0
  });

  await pipeline.ready();
  
  draw({
    pipeline,
    vertex
  })
}

const initScene3DWithObj = async() => { // UV, normal, default light
  await InitWebGPU();
  const pipeline = await Pipeline3D33.create();
  const vertex = await Vertex.fromObj33('objs/sphere.obj');
  const camera = new Camera([0, 2, 5]);

  const viewProjectionBuffer = camera.getBuffer();
  camera.update();
  pipeline.addUniformBindGroup({
    buffer: viewProjectionBuffer // by default it is group0 bind0
  });
  
  await pipeline.ready();
  draw({
    pipeline,
    vertex
  })
}


const initScene3DWithMultipleObj = async() => {
  await InitWebGPU();
  const pipeline = await Pipeline3DMultiple.create();

  const scene = new Scene();
  const camera = new Camera([0, 2, 5]);
  camera.update();

  const viewProjectionBuffer = camera.getBuffer();

  pipeline.addUniformBindGroup({
    group: 0,
    index: 0,
    buffer: viewProjectionBuffer, // by default it is group0 bind0
    name: 'vp',
    isDynamic: false
  });

  pipeline.addUniformBindGroup({
    group: 0, 
    index: 1,
    isDynamic: true,
    name: 'model',
    buffer: scene.getModelBuffer(), // has dynamic offset
  })

  pipeline.ready(true);

  const geo1 = new Geometry({vertex: await Vertex.fromObj332('objs/sphere.obj'), pipeline})
  geo1.translate([1, 0, 0]);
  const geo2 = new Geometry({vertex: await Vertex.fromObj332('objs/suzanne.obj'), pipeline});
  geo2.translate([-1, 0, 0]);

  scene.addGeometry(geo1);
  scene.addGeometry(geo2);
  scene.addCamera(camera);

  scene.render();
  scene.release();
}
const initScene3DWithMultipleObjAnimated = async() => {
  await InitWebGPU();
  const pipeline = await Pipeline3DMultiple.create();

  const scene = new Scene();
  const camera = new Camera([0, 2, 5]);
  camera.update();

  const viewProjectionBuffer = camera.getBuffer();

  pipeline.addUniformBindGroup({
    group: 0,
    index: 0,
    buffer: viewProjectionBuffer, // by default it is group0 bind0
    name: 'vp',
    isDynamic: false
  });

  pipeline.addUniformBindGroup({
    group: 0, 
    index: 1,
    isDynamic: true,
    name: 'model',
    buffer: scene.getModelBuffer(), // has dynamic offset
  })

  pipeline.ready(true);

  const geo1 = new Geometry({vertex: await Vertex.fromObj332('objs/sphere.obj'), pipeline})
  geo1.translate([2, 0, 0]);
  geo1.setFrameTransform(trans => {
    return {...trans, rotate: [trans.rotate[0], trans.rotate[1] + 0.01, trans.rotate[2]]}
  })
  const geo2 = new Geometry({vertex: await Vertex.fromObj332('objs/suzanne.obj'), pipeline});
  geo2.translate([-1, 0, 0]);

  scene.addGeometry(geo1);
  scene.addGeometry(geo2);
  scene.addCamera(camera);

  scene.renderFrame();
  //scene.release();
}


const initScene3DWithMultipleTexturedObjAnimated = async () => {
  await InitWebGPU();
  const pipeline = await Pipeline3DMultipleTextured.create();

  const scene = new Scene();
  const camera = new Camera([0, 2, 5]);


  camera.update();

  const viewProjectionBuffer = camera.getBuffer();

  pipeline.addUniformBindGroup({
    group: 0,
    index: 0,
    buffer: viewProjectionBuffer, // by default it is group0 bind0
    name: 'vp',
    isDynamic: false,
    type: BINDGROUPTYPE.UNIFORM,
  });

  pipeline.addUniformBindGroup({
    group: 0, 
    index: 1,
    isDynamic: true,
    name: 'model',
    buffer: scene.getModelBuffer(), // has dynamic offset
    type: BINDGROUPTYPE.UNIFORM
  })


  pipeline.ready(true);

  const geo1 = new Geometry({vertex: await Vertex.fromObj332('objs/sphere.obj'), pipeline})
  await geo1.addTexture(TEXTURE_TYPE.DIFFUSE, '/textures/sample.jpg');
  geo1.translate([2, 0, 0]);
  geo1.setFrameTransform(trans => {
    return {...trans, rotate: [trans.rotate[0], trans.rotate[1] + 0.01, trans.rotate[2]]}
  })
  const geo2 = new Geometry({vertex: await Vertex.fromObj332('objs/suzanne.obj'), pipeline});
  await geo2.addTexture(TEXTURE_TYPE.DIFFUSE, '/textures/suzanne_diffuse.png');
  geo2.translate([-1, 0, 0]);

  scene.addGeometry(geo1);
  scene.addGeometry(geo2);
  scene.addCamera(camera);

  scene.renderFrame();
}

//initScene2D()
//initScene3DWithCamera()
//initScene3DWithMultipleObj();
//initScene3DWithMultipleObjAnimated();
//initSceneCanvas();
initScene3DWithMultipleTexturedObjAnimated();

