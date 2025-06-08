export async function loadMaterial(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return parseMaterial(text);
  } catch (error) {
    console.error("Error loading MTL file:", error);
    throw error;
  }
}

function parseMaterial(mtlText) {
  const lines = mtlText.split("\n");
  const material = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    const parts = trimmedLine.split(/\s+/);
    const command = parts[0];

    switch (command) {
      case "map_Kd": // Diffuse texture map
        material.diffuseMap = parts[1];
        break;
    }
  }

  return material;
}

export async function loadTexture(gl, url) {
  return new Promise((resolve, reject) => {
    const texture = gl.createTexture();
    const image = new Image();

    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      gl.bindTexture(gl.TEXTURE_2D, null);

      console.log(`Texture loaded: ${url}`);
      resolve(texture);
    };

    image.onerror = () => {
      console.error(`Failed to load texture: ${url}`);
      reject(new Error(`Failed to load texture: ${url}`));
    };

    image.crossOrigin = "";
    image.src = url;
  });
}
