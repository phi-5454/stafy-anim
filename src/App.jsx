import { useState } from "react";

import "./App.css";
import RealtimePlot from "./RealtimePlot";

import React from "react";
import { Plane, OrthographicCamera } from "@react-three/drei";

import BlackbodyColormap from "./ColorGradient";

import Plotly from "plotly.js-dist";
import Plot from "react-plotly.js";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";

const aba = [];
let ba = 0;

function App() {
  const [[a, b], setAB] = useState([[], 0]);

  const up = () => {
    setAB([[...a, b], (b + 1) % 3]);
    requestAnimationFrame(up);
    aba.push(ba);
    ba += 1;
    console.log(aba);
  };
  requestAnimationFrame(up);

  const cm = BlackbodyColormap;
  return (
    <>
      <Canvas>
        <color attach="background" args={["magenta"]} />
        <gridHelper
          args={[10, 10, `white`, `gray`]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Plane scale={[2, 2, 1]}>
          <meshBasicMaterial color={"black"} />
        </Plane>
        <Plane>
          <meshBasicMaterial color={cm.getColor(50, 0, 100)} />
        </Plane>
        <Plane args={[0.5, 200, 1]} scale={[0.5, 2, 0]}>
          <meshBasicMaterial color={"white"} />
        </Plane>
      </Canvas>
      <RealtimePlot data={a} />
    </>
  );
}

export default App;
