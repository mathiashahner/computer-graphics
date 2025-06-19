const defaultObject = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  rotateX: false,
  rotateY: false,
  rotateZ: false,
  scale: 1,
  vao: null,
  vertexCount: 0,
  texture: {
    id: null,
    material: {},
  },
};

export function getDefaultObject(baseObject) {
  const object = structuredClone(defaultObject);

  object.vao = baseObject.vao;
  object.vertexCount = baseObject.vertexCount;
  object.texture.id = baseObject.texture.id;
  object.texture.material = baseObject.texture.material;

  return object;
}

export function resizeCanvas(canvas) {
  const container = canvas.parentElement;
  const containerRect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio;

  const displayWidth = Math.round(containerRect.width * dpr);
  const displayHeight = Math.round(containerRect.height * dpr);

  const needResize = canvas.width != displayWidth || canvas.height != displayHeight;

  if (needResize) {
    console.log(`Canvas size: ${displayWidth}x${displayHeight}px`);
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}
