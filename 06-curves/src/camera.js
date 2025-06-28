import { vec3, mat4 } from "gl-matrix";

export class FirstPersonCamera {
  constructor() {
    this.canvas = document.getElementById("canvas");

    this.position = vec3.fromValues(0.0, 0.0, 10.0);
    this.front = vec3.fromValues(0.0, 0.0, -1.0);
    this.up = vec3.fromValues(0.0, 1.0, 0.0);
    this.right = vec3.create();
    this.worldUp = vec3.fromValues(0.0, 1.0, 0.0);

    this.yaw = -90.0;
    this.pitch = 0.0;

    this.movementSpeed = 2.5;
    this.mouseSensitivity = 0.05;
    this.fov = 45.0;

    this.lastX = this.canvas.width / 2;
    this.lastY = this.canvas.height / 2;
    this.firstMouse = true;

    this.lastFrame = 0;
    this.deltaTime = 0;

    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
    };

    this.updateCameraVectors();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (key in this.keys) {
        this.keys[key] = true;
        event.preventDefault();
      }
    });

    document.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      if (key in this.keys) {
        this.keys[key] = false;
        event.preventDefault();
      }
    });

    this.canvas.addEventListener("click", () => {
      this.canvas.requestPointerLock();
    });

    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === this.canvas) {
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
      } else {
        document.removeEventListener("mousemove", this.onMouseMove.bind(this));
      }
    });

    this.canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.processMouseScroll(-event.deltaY);
    });
  }

  onMouseMove(event) {
    if (this.firstMouse) {
      this.lastX = event.movementX;
      this.lastY = event.movementY;
      this.firstMouse = false;
      return;
    }

    const xoffset = event.movementX * this.mouseSensitivity;
    const yoffset = -event.movementY * this.mouseSensitivity;

    this.yaw += xoffset;
    this.pitch += yoffset;

    if (this.pitch > 89.0) this.pitch = 89.0;
    if (this.pitch < -89.0) this.pitch = -89.0;

    this.updateCameraVectors();
  }

  processMouseScroll(yoffset) {
    this.fov -= yoffset * this.mouseSensitivity;
    if (this.fov < 1.0) this.fov = 1.0;
    if (this.fov > 45.0) this.fov = 45.0;
  }

  updateCameraVectors() {
    const front = vec3.create();
    front[0] = Math.cos(this.toRadians(this.yaw)) * Math.cos(this.toRadians(this.pitch));
    front[1] = Math.sin(this.toRadians(this.pitch));
    front[2] = Math.sin(this.toRadians(this.yaw)) * Math.cos(this.toRadians(this.pitch));

    vec3.normalize(this.front, front);

    vec3.cross(this.right, this.front, this.worldUp);
    vec3.normalize(this.right, this.right);

    vec3.cross(this.up, this.right, this.front);
    vec3.normalize(this.up, this.up);
  }

  getViewMatrix() {
    const viewMatrix = mat4.create();
    const center = vec3.create();
    vec3.add(center, this.position, this.front);
    mat4.lookAt(viewMatrix, this.position, center, this.up);
    return viewMatrix;
  }

  getProjectionMatrix(aspect) {
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, this.toRadians(this.fov), aspect, 0.1, 100.0);
    return projectionMatrix;
  }

  getPosition() {
    return this.position;
  }

  toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  update() {
    const currentFrame = performance.now() / 1000;
    this.deltaTime = currentFrame - this.lastFrame;
    this.lastFrame = currentFrame;

    const velocity = this.movementSpeed * this.deltaTime;

    if (this.keys.w) {
      const movement = vec3.create();
      vec3.scale(movement, this.front, velocity);
      vec3.add(this.position, this.position, movement);
    }

    if (this.keys.s) {
      const movement = vec3.create();
      vec3.scale(movement, this.front, velocity);
      vec3.subtract(this.position, this.position, movement);
    }

    if (this.keys.a) {
      const movement = vec3.create();
      vec3.scale(movement, this.right, velocity);
      vec3.subtract(this.position, this.position, movement);
    }

    if (this.keys.d) {
      const movement = vec3.create();
      vec3.scale(movement, this.right, velocity);
      vec3.add(this.position, this.position, movement);
    }
  }
}
