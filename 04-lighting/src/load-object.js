export async function loadObject(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return parseObject(text);
  } catch (error) {
    console.error("Error on load object file:", error);
    throw error;
  }
}

function parseObject(objectText) {
  const lines = objectText.split("\n");
  const vertices = [];
  const normals = [];
  const textureCoords = [];
  const faces = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    const parts = trimmedLine.split(/\s+/);
    const command = parts[0];

    switch (command) {
      case "v": // Vertex
        vertices.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
        break;

      case "vn": // Normal
        normals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
        break;

      case "vt": // Texture
        textureCoords.push([parseFloat(parts[1]), parseFloat(parts[2])]);
        break;

      case "f": // Face
        const face = [];
        for (let i = 1; i < parts.length; i++) {
          const indices = parts[i].split("/");
          face.push({
            vertex: parseInt(indices[0]) - 1,
            texture: indices[1] ? parseInt(indices[1]) - 1 : null,
            normal: indices[2] ? parseInt(indices[2]) - 1 : null,
          });
        }
        faces.push(face);
        break;
    }
  }

  return {
    vertices,
    normals,
    textureCoords,
    faces,
  };
}

export function createVertexData(objectData) {
  const vertexData = [];
  const { faces, vertices, textureCoords } = objectData;

  for (const face of faces) {
    for (const faceVertex of face) {
      const vertex = vertices[faceVertex.vertex];
      vertexData.push(...vertex);

      const texCoord = textureCoords[faceVertex.texture];
      vertexData.push(texCoord[0], texCoord[1]);
    }
  }

  return new Float32Array(vertexData);
}

export function getVertexCount(objectData) {
  let count = 0;
  for (const face of objectData.faces) {
    if (face.length === 3) {
      count += 3;
    } else if (face.length === 4) {
      count += 6;
    } else if (face.length > 4) {
      count += (face.length - 2) * 3;
    }
  }
  return count;
}
