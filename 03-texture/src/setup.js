import { fragmentShaderSource, vertexShaderSource } from "./shader";

export function setupProgram(gl) {
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

export function setupVertices(gl) {
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
