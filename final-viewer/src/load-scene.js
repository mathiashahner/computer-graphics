import { initializeState } from "./bezier.js";

export async function loadScene(sceneUrl) {
  const scene = await fetch(sceneUrl);
  return await scene.json();
}

export async function createObject(obj, object, texture) {
  const createdObject = {
    position: [...obj.position],
    rotation: obj.rotation,
    rotateX: obj.rotateX,
    rotateY: obj.rotateY,
    rotateZ: obj.rotateZ,
    scale: obj.scale,
    speed: obj.speed,
    trajectory: obj.trajectory,
    vao: object.vao,
    vertexCount: object.vertexCount,
    texture: {
      id: texture.id,
      material: texture.material,
    },
    trajectoryState: null,
  };

  if (obj.trajectory && obj.trajectory.length >= 4)
    createdObject.trajectoryState = initializeState(obj.trajectory);

  return createdObject;
}
