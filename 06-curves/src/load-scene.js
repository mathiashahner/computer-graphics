export async function loadScene(sceneUrl) {
  const scene = await fetch(sceneUrl);
  return await scene.json();
}

export async function createObject(obj, object, texture) {
  return {
    position: obj.position,
    rotation: obj.rotation,
    rotateX: obj.rotateX,
    rotateY: obj.rotateY,
    rotateZ: obj.rotateZ,
    scale: obj.scale,
    trajectory: obj.trajectory,
    vao: object.vao,
    vertexCount: object.vertexCount,
    texture: {
      id: texture.id,
      material: texture.material,
    },
  };
}
