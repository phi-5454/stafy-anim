import {Plane} from "@react-three/drei";
import React from "react";

function TexturedQuad(texture, transparent_p) {
    return (
        <Plane scale={[2, 2, 1]}>
            <meshBasicMaterial
                attach="material"
                transparent={transparent_p}
                map={texture.texture}
            />
        </Plane>
    );
}

export default TexturedQuad;