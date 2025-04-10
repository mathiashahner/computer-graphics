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

let angleX = 0;
let angleY = 0;
let angleZ = 0;
let scale = 1;

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

function setupKeyCallback() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "d" || event.key === "D") angleX += 0.05;
    if (event.key === "a" || event.key === "A") angleX -= 0.05;

    if (event.key === "c" || event.key === "C") angleY += 0.05;
    if (event.key === "z" || event.key === "Z") angleY -= 0.05;

    if (event.key === "w" || event.key === "W") angleZ += 0.05;
    if (event.key === "s" || event.key === "S") angleZ -= 0.05;

    if ((event.key === "q" || event.key === "Q") && scale > 0.05) scale -= 0.05;
    if ((event.key === "e" || event.key === "E") && scale < 2) scale += 0.05;

    if (event.key === "r" || event.key === "R") {
      angleX = 0;
      angleY = 0;
      angleZ = 0;
      scale = 1;
    }

    document.getElementById("control-value-x").innerText = angleX.toFixed(2);
    document.getElementById("control-value-y").innerText = angleY.toFixed(2);
    document.getElementById("control-value-z").innerText = angleZ.toFixed(2);
    document.getElementById("control-value-scale").innerText = scale.toFixed(2);
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
    gl.clearColor(0.175, 0.175, 0.175, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    mat4.identity(model);
    mat4.rotateX(model, model, angleX);
    mat4.rotateY(model, model, angleY);
    mat4.rotateZ(model, model, angleZ);
    mat4.scale(model, model, [scale, scale, scale]);

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
