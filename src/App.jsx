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
import PhysicsCanvas from "./PhysicsCanvas";

import Markdown from "react-markdown";

const bbbbb = `
`;

const aba = [1, 2, 3, 4, 5];
let ba = 0;
let frac = 0;

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function App() {
  return (
    //<div className="w-screen h-screen fixed top-0 left-0">
    <div className="w-full m-auto">
      <div className="flex flex-wrap sm:w-4/5 w-full m-0 justify-center p-0 sm:m-auto align-middle">
        <PhysicsCanvas />
      </div>
      <div className="m-auto justify-center sm:w-3/5 w-5/6 py-5">
        <Markdown className="prose prose-xl font-serif prose-invert m-auto">
          {bbbbb}
        </Markdown>
      </div>
    </div>
  );
}

export default App;
