import { createRoot } from "react-dom/client";
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Plane, OrthographicCamera } from "@react-three/drei";

function Foo() {
  const cameraRef = useRef();
  const { setDefaultCamera } = useThree();

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 0, 0); // Make the camera look at (0, 0, 0)
      //setDefaultCamera(cameraRef.current); // Set this camera as the default camera
    }
  }, [setDefaultCamera]);
  return (
    <OrthographicCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0, 1]} // Example position
      zoom={50} // Example zoom level, adjust as necessary
    />
  );
}

function ThreeCanvas(props) {
  return (
    <Canvas>
      <color attach="background" args={["magenta"]} />
      <Foo />
      <gridHelper
        args={[10, 10, `white`, `gray`]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <Plane scale={[2, 2, 1]}>
        <meshBasicMaterial color={"black"} />
      </Plane>
      <Plane>
        <meshBasicMaterial color={getColor(50, 0, 100)} />
      </Plane>
      <Plane args={[0.5, 200, 1]} scale={[0.5, 2, 0]}>
        <meshBasicMaterial color={"white"} />
      </Plane>
    </Canvas>
  );
}

export default ThreeCanvas;
