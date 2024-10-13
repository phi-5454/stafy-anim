import React from "react";

function TexturedQuad(texture, transparent_p) {
  return (
    <mesh>
      <planeGeometry args={[2, 2, 1]} />
      <meshBasicMaterial
        attach="material"
        transparent={transparent_p}
        map={texture.texture}
      />
    </mesh>
  );
}

export default TexturedQuad;
