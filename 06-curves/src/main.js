import "./style.css";

import { mat4 } from "gl-matrix";
import { FirstPersonCamera } from "./camera";
import { setupProgram, setupScene } from "./setup";
import { getDefaultObject, resizeCanvas } from "./utils";

let objects = [];
let selectedObject = 0;
let camera = new FirstPersonCamera();

async function resetHandler(gl, key) {
  if (key === "r") {
    selectedObject = 0;
    objects = await setupScene(gl);
    camera = new FirstPersonCamera();
  }
}

function changeSelectedHandler(key) {
  if (key.match(/^[1-9]$/)) {
    const num = parseInt(key, 10);
    if (num <= objects.length) selectedObject = num - 1;
  }

  if (key === "{") selectedObject = Math.max(selectedObject - 1, 0);
  if (key === "}") selectedObject = Math.min(selectedObject + 1, objects.length - 1);
}

function changeRotationHandler(key) {
  let object = objects[selectedObject];

  if (key === "x") object.rotateX = !object.rotateX;
  if (key === "y") object.rotateY = !object.rotateY;
  if (key === "z") object.rotateZ = !object.rotateZ;
}

function changePositionHandler(key) {
  let position = objects[selectedObject].position;

  if (key === "arrowright") position[0] += 0.05;
  if (key === "arrowleft") position[0] -= 0.05;

  if (key === "arrowup") position[1] += 0.05;
  if (key === "arrowdown") position[1] -= 0.05;

  if (key === "e") position[2] += 0.05;
  if (key === "q") position[2] -= 0.05;
}

function changeScaleHandler(key) {
  let object = objects[selectedObject];

  if (key === "[") object.scale = Math.max(object.scale - 0.05, 0.05);
  if (key === "]") object.scale = Math.min(object.scale + 0.05, 10);
}

function changeTrajectorySpeedHandler(key) {
  let object = objects[selectedObject];

  if (object.trajectoryState) {
    if (key === ",") {
      object.trajectoryState.speed = Math.max(object.trajectoryState.speed - 0.001, 0.001);
    }
    if (key === ".") {
      object.trajectoryState.speed = Math.min(object.trajectoryState.speed + 0.001, 0.1);
    }
  }
}

function changeCountHandler(key) {
  if (key === "-" && objects.length > 1) {
    objects.pop();
    selectedObject = Math.max(selectedObject - 1, 0);
  }

  if (key === "+" && objects.length < 99) {
    objects.push(getDefaultObject(objects[0]));
    selectedObject = objects.length - 1;
  }
}

function setupKeyCallback(gl) {
  document.addEventListener("keydown", async (event) => {
    const key = event.key.toLowerCase();

    await resetHandler(gl, key);
    changeSelectedHandler(key);
    changeRotationHandler(key);
    changePositionHandler(key);
    changeScaleHandler(key);
    changeTrajectorySpeedHandler(key);
    changeCountHandler(key);

    const object = objects[selectedObject];

    document.getElementById("control-value-x").innerText = object.position[0].toFixed(2);
    document.getElementById("control-value-y").innerText = object.position[1].toFixed(2);
    document.getElementById("control-value-z").innerText = object.position[2].toFixed(2);
    document.getElementById("control-value-scale").innerText = object.scale.toFixed(2);
    document.getElementById("control-value-instances").innerText = objects.length;
    document.getElementById("control-value-selected").innerText = selectedObject + 1;

    document.getElementById("control-value-trajectory-speed").innerText =
      object.trajectoryState.speed.toFixed(3);
  });
}

async function main() {
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl2");

  const program = setupProgram(gl);
  objects = await setupScene(gl);

  setupKeyCallback(gl);

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
  const normalMatrix = mat4.create();

  gl.uniform3fv(lightPositionLocation, [2.0, 2.0, 2.0]);
  gl.uniform3fv(lightAmbientLocation, [0.2, 0.2, 0.2]);
  gl.uniform3fv(lightDiffuseLocation, [0.8, 0.8, 0.8]);
  gl.uniform3fv(lightSpecularLocation, [1.0, 1.0, 1.0]);

  function render() {
    camera.update();
    resizeCanvas(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const aspect = gl.canvas.width / gl.canvas.height;
    const view = camera.getViewMatrix();
    const projection = camera.getProjectionMatrix(aspect);

    gl.uniformMatrix4fv(viewLocation, false, view);
    gl.uniformMatrix4fv(projectionLocation, false, projection);
    gl.uniform3fv(viewPositionLocation, camera.getPosition());

    gl.clearColor(0.175, 0.175, 0.175, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(textureLocation, 0);

    for (let i = 0; i < objects.length; i++) {
      const { position, rotateX, rotateY, rotateZ, scale, texture, vao, vertexCount } = objects[i];
      const { ambient, diffuse, specular, shininess } = texture.material;

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

      gl.uniform3fv(materialAmbientLocation, ambient);
      gl.uniform3fv(materialDiffuseLocation, diffuse);
      gl.uniform3fv(materialSpecularLocation, specular);
      gl.uniform1f(materialShininessLocation, shininess);

      gl.uniformMatrix4fv(modelLocation, false, model);
      gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);

      gl.bindVertexArray(vao);
      gl.bindTexture(gl.TEXTURE_2D, texture.id);
      gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    }

    gl.bindVertexArray(null);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
