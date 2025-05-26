import "./style.css";

import { mat4 } from "gl-matrix";

const vertexShaderSource = `#version 300 es
  in vec3 position;
  in vec3 color;
  uniform mat4 model;
  out vec4 finalColor;

  void main() {
    gl_Position = model * vec4(position, 1.0);
    finalColor = vec4(color, 1.0);
  }
`;

const fragmentShaderSource = `#version 300 es
  precision mediump float;
  in vec4 finalColor;
  out vec4 color;
  
  void main() {
    color = finalColor;
  }
`;

const defaultCube = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  rotateX: false,
  rotateY: false,
  rotateZ: false,
  scale: 1,
};

let selectedCube = 0;
let cubes = [structuredClone(defaultCube)];

function setupProgram(gl) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getShaderInfoLog(vertexShader));
    console.error(gl.getShaderInfoLog(fragmentShader));
    console.error(gl.getProgramInfoLog(program));
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

function setupVertices(gl) {
  const vertices = new Float32Array([
    // Front
    -0.5, 0.5, 0.5, 0.25, 0.0, 0.0, -0.5, -0.5, 0.5, 0.25, 0.0, 0.0, 0.5, 0.5, 0.5, 0.25, 0.0, 0.0,
    0.5, -0.5, 0.5, 0.25, 0.0, 0.0, -0.5, -0.5, 0.5, 0.25, 0.0, 0.0, 0.5, 0.5, 0.5, 0.25, 0.0, 0.0,

    // Back
    -0.5, 0.5, -0.5, 0.0, 0.25, 0.0, -0.5, -0.5, -0.5, 0.0, 0.25, 0.0, 0.5, 0.5, -0.5, 0.0, 0.25,
    0.0, 0.5, -0.5, -0.5, 0.0, 0.25, 0.0, -0.5, -0.5, -0.5, 0.0, 0.25, 0.0, 0.5, 0.5, -0.5, 0.0,
    0.25, 0.0,

    // Left
    -0.5, 0.5, -0.5, 0.0, 0.0, 0.25, -0.5, -0.5, -0.5, 0.0, 0.0, 0.25, -0.5, 0.5, 0.5, 0.0, 0.0,
    0.25, -0.5, -0.5, 0.5, 0.0, 0.0, 0.25, -0.5, -0.5, -0.5, 0.0, 0.0, 0.25, -0.5, 0.5, 0.5, 0.0,
    0.0, 0.25,

    // Right
    0.5, 0.5, -0.5, 0.25, 0.25, 0.0, 0.5, -0.5, -0.5, 0.25, 0.25, 0.0, 0.5, 0.5, 0.5, 0.25, 0.25,
    0.0, 0.5, -0.5, 0.5, 0.25, 0.25, 0.0, 0.5, -0.5, -0.5, 0.25, 0.25, 0.0, 0.5, 0.5, 0.5, 0.25,
    0.25, 0.0,

    // Top
    -0.5, 0.5, 0.5, 0.0, 0.25, 0.25, -0.5, 0.5, -0.5, 0.0, 0.25, 0.25, 0.5, 0.5, 0.5, 0.0, 0.25,
    0.25, 0.5, 0.5, -0.5, 0.0, 0.25, 0.25, -0.5, 0.5, -0.5, 0.0, 0.25, 0.25, 0.5, 0.5, 0.5, 0.0,
    0.25, 0.25,

    // Bottom
    -0.5, -0.5, 0.5, 0.25, 0.0, 0.25, -0.5, -0.5, -0.5, 0.25, 0.0, 0.25, 0.5, -0.5, 0.5, 0.25, 0.0,
    0.25, 0.5, -0.5, -0.5, 0.25, 0.0, 0.25, -0.5, -0.5, -0.5, 0.25, 0.0, 0.25, 0.5, -0.5, 0.5, 0.25,
    0.0, 0.25,
  ]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const stride = 6 * Float32Array.BYTES_PER_ELEMENT;

  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(0);

  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(1);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindVertexArray(null);

  return vao;
}

function resetHandler(key) {
  if (key === "r") {
    cubes = [structuredClone(defaultCube)];
    selectedCube = 0;
  }
}

function changeSelectedCubeHandler(key) {
  if (key.match(/^[0-9]$/)) {
    const num = parseInt(key, 10);
    if (num > 0 && num <= cubes.length) selectedCube = num - 1;
  }
}

function changeRotationHandler(key) {
  let cube = cubes[selectedCube];

  if (key === "x") cube.rotateX = !cube.rotateX;
  if (key === "y") cube.rotateY = !cube.rotateY;
  if (key === "z") cube.rotateZ = !cube.rotateZ;
}

function changePositionHandler(key) {
  let position = cubes[selectedCube].position;

  if (key === "d") position[0] += 0.05;
  if (key === "a") position[0] -= 0.05;

  if (key === "w") position[1] += 0.05;
  if (key === "s") position[1] -= 0.05;

  if (key === "e") position[2] += 0.05;
  if (key === "q") position[2] -= 0.05;
}

function changeScaleHandler(key) {
  let cube = cubes[selectedCube];

  if (key === "[") cube.scale = Math.max(cube.scale - 0.05, 0.05);
  if (key === "]") cube.scale = Math.min(cube.scale + 0.05, 2);
}

function changeCubeCountHandler(key) {
  if (key === "arrowdown" && cubes.length > 1) {
    cubes.pop();
    selectedCube = Math.max(selectedCube - 1, 0);
  }

  if (key === "arrowup" && cubes.length < 9) {
    cubes.push(structuredClone(defaultCube));
  }
}

function setupKeyCallback() {
  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    resetHandler(key);
    changeSelectedCubeHandler(key);
    changeRotationHandler(key);
    changePositionHandler(key);
    changeScaleHandler(key);
    changeCubeCountHandler(key);

    const cube = cubes[selectedCube];

    document.getElementById("control-value-x").innerText = cube.position[0].toFixed(2);
    document.getElementById("control-value-y").innerText = cube.position[1].toFixed(2);
    document.getElementById("control-value-z").innerText = cube.position[2].toFixed(2);
    document.getElementById("control-value-scale").innerText = cube.scale.toFixed(2);
    document.getElementById("control-value-instances").innerText = cubes.length;
    document.getElementById("control-value-selected").innerText = selectedCube + 1;
  });
}

function resizeCanvas(canvas) {
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

function main() {
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl2");

  const program = setupProgram(gl);
  const vao = setupVertices(gl);
  setupKeyCallback();

  gl.useProgram(program);

  const modelLocation = gl.getUniformLocation(program, "model");
  const model = mat4.create();

  gl.uniformMatrix4fv(modelLocation, false, model);

  function render() {
    resizeCanvas(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.175, 0.175, 0.175, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.bindVertexArray(vao);

    for (let i = 0; i < cubes.length; i++) {
      const { position, rotateX, rotateY, rotateZ, scale } = cubes[i];
      const angle = performance.now() / 1000;
      let rotation = cubes[i].rotation;

      mat4.identity(model);
      mat4.translate(model, model, position);

      if (rotateX) rotation[0] = angle;
      mat4.rotateX(model, model, rotation[0]);

      if (rotateY) rotation[1] = angle;
      mat4.rotateY(model, model, rotation[1]);

      if (rotateZ) rotation[2] = angle;
      mat4.rotateZ(model, model, rotation[2]);

      mat4.scale(model, model, [scale, scale, scale]);

      gl.uniformMatrix4fv(modelLocation, false, model);
      gl.drawArrays(gl.TRIANGLES, 0, 36);
      gl.drawArrays(gl.POINTS, 0, 36);
    }

    gl.bindVertexArray(null);

    requestAnimationFrame(render);
  }

  render();
}

main();
