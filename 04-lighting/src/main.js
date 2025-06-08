import "./style.css";

import { mat4 } from "gl-matrix";
import { getDefaultObject, resizeCanvas } from "./utils";
import { setupMaterial, setupProgram, setupVertices } from "./setup";

let selectedObject = 0;
let objects = [getDefaultObject()];

function resetHandler(key) {
  if (key === "r") {
    objects = [getDefaultObject()];
    selectedObject = 0;
  }
}

function changeSelectedHandler(key) {
  if (key.match(/^[0-9]$/)) {
    const num = parseInt(key, 10);
    if (num > 0 && num <= objects.length) selectedObject = num - 1;
  }
}

function changeRotationHandler(key) {
  let object = objects[selectedObject];

  if (key === "x") object.rotateX = !object.rotateX;
  if (key === "y") object.rotateY = !object.rotateY;
  if (key === "z") object.rotateZ = !object.rotateZ;
}

function changePositionHandler(key) {
  let position = objects[selectedObject].position;

  if (key === "d") position[0] += 0.05;
  if (key === "a") position[0] -= 0.05;

  if (key === "w") position[1] += 0.05;
  if (key === "s") position[1] -= 0.05;

  if (key === "e") position[2] += 0.05;
  if (key === "q") position[2] -= 0.05;
}

function changeScaleHandler(key) {
  let object = objects[selectedObject];

  if (key === "[") object.scale = Math.max(object.scale - 0.05, 0.05);
  if (key === "]") object.scale = Math.min(object.scale + 0.05, 2);
}

function changeCountHandler(key) {
  if (key === "arrowdown" && objects.length > 1) {
    objects.pop();
    selectedObject = Math.max(selectedObject - 1, 0);
  }

  if (key === "arrowup" && objects.length < 9) {
    objects.push(getDefaultObject());
  }
}

function setupKeyCallback() {
  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    resetHandler(key);
    changeSelectedHandler(key);
    changeRotationHandler(key);
    changePositionHandler(key);
    changeScaleHandler(key);
    changeCountHandler(key);

    const object = objects[selectedObject];

    document.getElementById("control-value-x").innerText = object.position[0].toFixed(2);
    document.getElementById("control-value-y").innerText = object.position[1].toFixed(2);
    document.getElementById("control-value-z").innerText = object.position[2].toFixed(2);
    document.getElementById("control-value-scale").innerText = object.scale.toFixed(2);
    document.getElementById("control-value-instances").innerText = objects.length;
    document.getElementById("control-value-selected").innerText = selectedObject + 1;
  });
}

async function main() {
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl2");

  const program = setupProgram(gl);
  const object = await setupVertices(gl, "/model.obj");
  const texture = await setupMaterial(gl, "/model.mtl");

  setupKeyCallback();

  const modelLocation = gl.getUniformLocation(program, "model");
  const viewLocation = gl.getUniformLocation(program, "view");
  const projectionLocation = gl.getUniformLocation(program, "projection");
  const normalMatrixLocation = gl.getUniformLocation(program, "normalMatrix");
  const textureLocation = gl.getUniformLocation(program, "uTexture");

  const materialAmbientLocation = gl.getUniformLocation(program, "uMaterialAmbient");
  const materialDiffuseLocation = gl.getUniformLocation(program, "uMaterialDiffuse");
  const materialSpecularLocation = gl.getUniformLocation(program, "uMaterialSpecular");
  const materialShininessLocation = gl.getUniformLocation(program, "uMaterialShininess");

  const lightPositionLocation = gl.getUniformLocation(program, "uLightPosition");
  const lightAmbientLocation = gl.getUniformLocation(program, "uLightAmbient");
  const lightDiffuseLocation = gl.getUniformLocation(program, "uLightDiffuse");
  const lightSpecularLocation = gl.getUniformLocation(program, "uLightSpecular");

  const viewPositionLocation = gl.getUniformLocation(program, "uViewPosition");

  const model = mat4.create();
  const view = mat4.create();
  const projection = mat4.create();
  const normalMatrix = mat4.create();

  mat4.lookAt(view, [0, 0, 3], [0, 0, 0], [0, 1, 0]);
  gl.uniformMatrix4fv(viewLocation, false, view);
  gl.uniform3fv(viewPositionLocation, [0, 0, 3]);

  gl.uniform3fv(materialAmbientLocation, texture.material.ambient);
  gl.uniform3fv(materialDiffuseLocation, texture.material.diffuse);
  gl.uniform3fv(materialSpecularLocation, texture.material.specular);
  gl.uniform1f(materialShininessLocation, texture.material.shininess);

  gl.uniform3fv(lightPositionLocation, [2.0, 2.0, 2.0]);
  gl.uniform3fv(lightAmbientLocation, [0.2, 0.2, 0.2]);
  gl.uniform3fv(lightDiffuseLocation, [0.8, 0.8, 0.8]);
  gl.uniform3fv(lightSpecularLocation, [1.0, 1.0, 1.0]);

  function render() {
    resizeCanvas(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const aspect = gl.canvas.width / gl.canvas.height;
    mat4.perspective(projection, Math.PI / 4, aspect, 0.1, 100.0);
    gl.uniformMatrix4fv(projectionLocation, false, projection);

    gl.clearColor(0.175, 0.175, 0.175, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.bindVertexArray(object.vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture.id);
    gl.uniform1i(textureLocation, 0);

    for (let i = 0; i < objects.length; i++) {
      const { position, rotateX, rotateY, rotateZ, scale } = objects[i];
      const angle = performance.now() / 1000;
      let rotation = objects[i].rotation;

      mat4.identity(model);
      mat4.translate(model, model, position);

      if (rotateX) rotation[0] = angle;
      mat4.rotateX(model, model, rotation[0]);

      if (rotateY) rotation[1] = angle;
      mat4.rotateY(model, model, rotation[1]);

      if (rotateZ) rotation[2] = angle;
      mat4.rotateZ(model, model, rotation[2]);

      mat4.scale(model, model, [scale, scale, scale]);

      mat4.invert(normalMatrix, model);
      mat4.transpose(normalMatrix, normalMatrix);

      gl.uniformMatrix4fv(modelLocation, false, model);
      gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);
      gl.drawArrays(gl.TRIANGLES, 0, object.vertexCount);
    }

    gl.bindVertexArray(null);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
