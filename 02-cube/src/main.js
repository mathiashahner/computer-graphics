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
    gl_PointSize = 10.0;
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

let rotateX = false;
let rotateY = false;
let rotateZ = false;

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
    -0.5, 0.5, 0.5, 1.0, 0.0, 0.0, -0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 0.5, 0.5, 0.5, 1.0, 0.0, 0.0,
    0.5, -0.5, 0.5, 1.0, 0.0, 0.0, -0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 0.5, 0.5, 0.5, 1.0, 0.0, 0.0,

    // Back
    -0.5, 0.5, -0.5, 0.0, 1.0, 0.0, -0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
    0.5, -0.5, -0.5, 0.0, 1.0, 0.0, -0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 0.5, 0.5, -0.5, 0.0, 1.0, 0.0,

    // Left
    -0.5, 0.5, -0.5, 0.0, 0.0, 1.0, -0.5, -0.5, -0.5, 0.0, 0.0, 1.0, -0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
    -0.5, -0.5, 0.5, 0.0, 0.0, 1.0, -0.5, -0.5, -0.5, 0.0, 0.0, 1.0, -0.5, 0.5, 0.5, 0.0, 0.0, 1.0,

    // Right
    0.5, 0.5, -0.5, 1.0, 1.0, 0.0, 0.5, -0.5, -0.5, 1.0, 1.0, 0.0, 0.5, 0.5, 0.5, 1.0, 1.0, 0.0,
    0.5, -0.5, 0.5, 1.0, 1.0, 0.0, 0.5, -0.5, -0.5, 1.0, 1.0, 0.0, 0.5, 0.5, 0.5, 1.0, 1.0, 0.0,

    // Top
    -0.5, 0.5, 0.5, 0.0, 1.0, 1.0, -0.5, 0.5, -0.5, 0.0, 1.0, 1.0, 0.5, 0.5, 0.5, 0.0, 1.0, 1.0,
    0.5, 0.5, -0.5, 0.0, 1.0, 1.0, -0.5, 0.5, -0.5, 0.0, 1.0, 1.0, 0.5, 0.5, 0.5, 0.0, 1.0, 1.0,

    // Bottom
    -0.5, -0.5, 0.5, 1.0, 0.0, 1.0, -0.5, -0.5, -0.5, 1.0, 0.0, 1.0, 0.5, -0.5, 0.5, 1.0, 0.0, 1.0,
    0.5, -0.5, -0.5, 1.0, 0.0, 1.0, -0.5, -0.5, -0.5, 1.0, 0.0, 1.0, 0.5, -0.5, 0.5, 1.0, 0.0, 1.0,
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

function setupKeyCallback() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "x" || event.key === "X") rotateX = !rotateX;
    if (event.key === "y" || event.key === "Y") rotateY = !rotateY;
    if (event.key === "z" || event.key === "Z") rotateZ = !rotateZ;
  });
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
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    let angle = performance.now() / 1000;

    mat4.identity(model);
    if (rotateX) mat4.rotateX(model, model, angle);
    if (rotateY) mat4.rotateY(model, model, angle);
    if (rotateZ) mat4.rotateZ(model, model, angle);

    gl.uniformMatrix4fv(modelLocation, false, model);

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    gl.drawArrays(gl.POINTS, 0, 36);
    gl.bindVertexArray(null);

    requestAnimationFrame(render);
  }

  render();
}

main();
