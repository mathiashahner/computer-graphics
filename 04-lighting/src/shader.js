export const vertexShaderSource = `#version 300 es
  in vec3 position;
  in vec2 texCoord;
  in vec3 normal;

  uniform mat4 model;
  uniform mat4 view;
  uniform mat4 projection;
  uniform mat4 normalMatrix;

  out vec2 vTexCoord;
  out vec3 vNormal;
  out vec3 vFragPos;

  void main() {
    gl_Position = projection * view * model * vec4(position, 1.0);
    vTexCoord = texCoord;
    vNormal = mat3(normalMatrix) * normal;
    vFragPos = vec3(model * vec4(position, 1.0));
  }
`;

export const fragmentShaderSource = `#version 300 es
  precision mediump float;

  in vec2 vTexCoord;
  in vec3 vNormal;
  in vec3 vFragPos;

  uniform sampler2D uTexture;

  uniform vec3 uMaterialAmbient;
  uniform vec3 uMaterialDiffuse;
  uniform vec3 uMaterialSpecular;
  uniform float uMaterialShininess;

  uniform vec3 uLightPosition;
  uniform vec3 uLightAmbient;
  uniform vec3 uLightDiffuse;
  uniform vec3 uLightSpecular;

  uniform vec3 uViewPosition;
  
  out vec4 color;
  
  void main() {
    vec3 textureColor = texture(uTexture, vTexCoord).rgb;
    vec3 norm = normalize(vNormal);

    vec3 lightDir = normalize(uLightPosition - vFragPos);
    vec3 viewDir = normalize(uViewPosition - vFragPos);
    vec3 reflectDir = reflect(-lightDir, norm);

    vec3 ambient = uLightAmbient * uMaterialAmbient * textureColor;

    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = uLightDiffuse * (diff * uMaterialDiffuse) * textureColor;

    float spec = pow(max(dot(viewDir, reflectDir), 0.0), uMaterialShininess);
    vec3 specular = uLightSpecular * (spec * uMaterialSpecular);

    vec3 result = ambient + diffuse + specular;
    color = vec4(result, 1.0);
  }
`;
