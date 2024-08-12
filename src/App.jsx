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

const aba = [1, 2, 3, 4, 5];
let ba = 0;
let frac = 0;

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function App() {
  const cm = BlackbodyColormap;
  return (
    <>
      <PhysicsCanvas />
    </>
  );
}

/*
 *
      <RealtimePlot data={aba} />
 * */
export default App;
