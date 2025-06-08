export const vertexShaderSource = `#version 300 es
  in vec3 position;
  in vec2 texCoord;
  uniform mat4 model;
  uniform mat4 view;
  uniform mat4 projection;
  out vec2 vTexCoord;

  void main() {
    gl_Position = projection * view * model * vec4(position, 1.0);
    vTexCoord = texCoord;
  }
`;

export const fragmentShaderSource = `#version 300 es
  precision mediump float;
  in vec2 vTexCoord;
  uniform sampler2D uTexture;
  out vec4 color;
  
  void main() {
    color = texture(uTexture, vTexCoord);
  }
`;
