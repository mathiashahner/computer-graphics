import { createObject, loadScene } from "./load-scene";
import { loadMaterial, loadTexture } from "./load-texture";
import { fragmentShaderSource, vertexShaderSource } from "./shader";
import { createVertexData, getVertexCount, loadObject } from "./load-object";

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

  gl.useProgram(program);

  return program;
}

async function setupVertices(gl, objUrl) {
  try {
    const objData = await loadObject(objUrl);
    console.log("Object file loaded:", objData);

    const vertices = createVertexData(objData);
    const vertexCount = getVertexCount(objData);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // 3 for position + 2 for texture coordinates + 3 for normals
    const stride = 8 * Float32Array.BYTES_PER_ELEMENT;

    // Position attribute (location 0)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(0);

    // Texture coordinate attribute (location 1)
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(1);

    // Normal attribute (location 2)
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, stride, 5 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(2);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    return { vao, vertexCount };
  } catch (error) {
    console.error("Error on vertex setup:", error);
  }
}

async function setupMaterial(gl, mtlUrl) {
  try {
    const material = await loadMaterial(mtlUrl);
    const loadedTexture = {};

    const basePath = mtlUrl.substring(0, mtlUrl.lastIndexOf("/") + 1);
    const textureUrl = basePath + material.diffuseMap;

    loadedTexture.id = await loadTexture(gl, textureUrl);
    loadedTexture.material = material;
    return loadedTexture;
  } catch (error) {
    console.error("Error loading material textures:", error);
    throw error;
  }
}

export async function setupScene(gl) {
  const scene = await loadScene("/scene.json");

  const objects = scene.objects.map(async (obj) => {
    const object = await setupVertices(gl, obj.objectPath);
    const texture = await setupMaterial(gl, obj.materialPath);
    return createObject(obj, object, texture);
  });

  return Promise.all(objects);
}
