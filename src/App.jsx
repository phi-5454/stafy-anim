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
  const [a, setA] = useState([1, 2, 3, 4, 5]);

  //let n = useRef(1);
  useEffect(() => {
    const up = () => {
      //setAB([[...a, b], (b + 1) % 3]);
      frac += 1;
      //setA(a.map((x) => x + 1));
      //aba.push(ba);
      /*
      aba.forEach(function (element, index, arr) {
        aba[index] = (element * (frac - 1.0)) / frac; // Example operation: multiply each element by 2
      });
      */

      ba = (ba + 1) % 5;
      let i = getRandomInt(0, 5);
      aba[i] += 1 / frac; //console.log(aba);
      aba[i] += 1; //console.log(aba);
      requestAnimationFrame(up);
    };
    requestAnimationFrame(up);

    return () => {};
  });

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
