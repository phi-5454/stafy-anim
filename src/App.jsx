import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import React from "react";

import Plotly from "plotly.js-dist";
import Plot from "react-plotly.js";

import * as THREE from "three";
import { useEffect, useRef } from "react";
let i = 0;

function PlotA() {
  //const xa = useRef([]);
  const refDiv = useRef(null);
  const [a, setA] = useState(0);

  useEffect(() => {
    let TESTER = refDiv.current;
    var n = 100;

    let x = [],
      y = [],
      z = [];

    console.log(x.length);
    var dt = 0.015;

    for (i = 0; i < n; i++) {
      x[i] = Math.random() * 2 - 1;

      y[i] = Math.random() * 2 - 1;

      z[i] = 30 + Math.random() * 10;
    }

    console.log(TESTER);
    TESTER &&
      Plotly.newPlot(
        TESTER,
        [
          {
            x: x,

            y: z,

            mode: "markers",
          },
        ],
        {
          xaxis: { range: [-40, 40] },
          yaxis: { range: [0, 60] },
        },
      );

    function compute() {
      let s = 10,
        b = 8 / 3,
        r = 28;

      let dx, dy, dz;
      let xh, yh, zh;

      for (let i = 0; i < n; i++) {
        dx = s * (y[i] - x[i]);
        dy = x[i] * (r - z[i]) - y[i];
        dz = x[i] * y[i] - b * z[i];
        xh = x[i] + dx * dt * 0.5;
        yh = y[i] + dy * dt * 0.5;
        zh = z[i] + dz * dt * 0.5;
        dx = s * (yh - xh);
        dy = xh * (r - zh) - yh;
        dz = xh * yh - b * zh;
        x[i] += dx * dt;
        y[i] += dy * dt;
        z[i] += dz * dt;
      }
    }

    let stopped = false;

    function update() {
      !stopped && requestAnimationFrame(update);
      // TODO:  Why does this fix everyghing???
      //setA(a + 1);
      compute();

      TESTER &&
        Plotly.animate(
          TESTER,
          {
            data: [{ x: x, y: z }],
          },
          {
            transition: {
              duration: 0,
            },

            frame: {
              duration: 0,

              redraw: false,
            },
          },
        );
    }

    update();

    return () => {
      // stop recursion
      stopped = true;
      // Purge the plot
      TESTER && Plotly.purge(TESTER);
    };
  }, [a]);

  return (
    <>
      <div ref={refDiv}></div>
    </>
  );
}

function PlotDisp(data) {
  //const xa = useRef([]);
  const refDiv = useRef(null);
  const [a, setA] = useState(0);

  useEffect(() => {
    let TESTER = refDiv.current;
    var n = 100;

    // Make sure we don't have something there
    TESTER && Plotly.purge(TESTER);
    if (TESTER) {
      while (TESTER.firstChild) {
        console.log("YARYAR  ", TESTER.firstChild);
        TESTER.removeChild(TESTER.firstChild);
      }
    }
    console.log("AAA");

    let x = [],
      y = [],
      z = [];

    console.log(x.length);
    var dt = 0.015;

    for (i = 0; i < n; i++) {
      x[i] = Math.random() * 2 - 1;

      y[i] = Math.random() * 2 - 1;

      z[i] = 30 + Math.random() * 10;
    }

    console.log(TESTER);
    TESTER &&
      Plotly.newPlot(
        TESTER,
        [
          {
            x: x,

            y: z,

            mode: "markers",
          },
        ],
        {
          xaxis: { range: [-40, 40] },

          yaxis: { range: [0, 60] },
        },
      );

    function compute() {
      let s = 10,
        b = 8 / 3,
        r = 28;

      let dx, dy, dz;
      let xh, yh, zh;

      for (let i = 0; i < n; i++) {
        dx = s * (y[i] - x[i]);
        dy = x[i] * (r - z[i]) - y[i];
        dz = x[i] * y[i] - b * z[i];
        xh = x[i] + dx * dt * 0.5;
        yh = y[i] + dy * dt * 0.5;
        zh = z[i] + dz * dt * 0.5;
        dx = s * (yh - xh);
        dy = xh * (r - zh) - yh;
        dz = xh * yh - b * zh;
        x[i] += dx * dt;
        y[i] += dy * dt;
        z[i] += dz * dt;
      }
    }

    function update() {
      requestAnimationFrame(update);
      // TODO:  Why does this fix everyghing???
      //setA(a + 1);
      compute();

      TESTER &&
        Plotly.animate(
          TESTER,
          {
            data: [{ x: x, y: z }],
          },
          {
            transition: {
              duration: 0,
            },

            frame: {
              duration: 0,

              redraw: false,
            },
          },
        );
    }

    update();

    return () => {
      console.log("BB");
      TESTER &&
        Plotly.newPlot(
          TESTER,
          [
            {
              x: [],
              y: [],
              mode: "markers",
            },
          ],
          {
            xaxis: { range: [-40, 40] },

            yaxis: { range: [0, 60] },
          },
        );
      TESTER && Plotly.purge(TESTER);
      if (TESTER) {
        while (TESTER.firstChild) {
          console.log("YARYAR  ", TESTER.firstChild);
          TESTER.removeChild(TESTER.firstChild);
        }
      }
      //refDiv && (<Plotly></Plotly>)(c);
    };
  }, [a]);

  /*
   */

  return (
    <>
      <div ref={refDiv}></div>
    </>
  );
}

function App() {
  const [x, setx] = useState([]);
  const refContainer = useRef(null);

  useEffect(() => {
    let c = refContainer.current;
    // === THREE.JS CODE START ===
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // document.body.appendChild( renderer.domElement );
    // use ref as a mount point of the Three.js scene instead of the document.body
    refContainer.current &&
      refContainer.current.appendChild(renderer.domElement);
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    camera.position.z = 5;
    var animate = function () {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      i += 1;
      console.log(i);
      /*
        Plotly.animate(
          "myPlot",
          {
            data: [{ x: x }],
          },
          {
            transition: {
              duration: 0,
            },

            frame: {
              duration: 0,

              redraw: false,
            },
          },
        );
        */
      //setx([...x, Math.random()]);
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      c.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [x]);

  return (
    <>
      <div ref={refContainer}></div>
      <PlotA />
    </>
  );
}

export default PlotA;
