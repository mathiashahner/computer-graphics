const defaultObject = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  rotateX: false,
  rotateY: false,
  rotateZ: false,
  scale: 1,
};

export function getDefaultObject() {
  return structuredClone(defaultObject);
}

export function resizeCanvas(canvas) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio;

  const size = Math.min(width, height);

  const displayWidth = Math.round(size * dpr);
  const displayHeight = Math.round(size * dpr);

  const needResize = canvas.width != displayWidth || canvas.height != displayHeight;

  if (needResize) {
    console.log(`Canvas size: ${size}px`, displayWidth, displayHeight);
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}
