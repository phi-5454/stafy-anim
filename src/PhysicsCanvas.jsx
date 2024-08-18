import React, { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import Plotly from "plotly.js-dist";
import * as dat from "dat.gui";

import Plot from "react-plotly.js";
import RealtimePlot from "./RealtimePlot";
import { Plane } from "@react-three/drei";
import BlackbodyColormap from "./ColorGradient";
import { binomialDistribution } from "simple-statistics";
import { Camera, OrthographicCamera } from "three";
import("simple-statistics");
import * as THREE from "three";

// get random in [0, max) (exclusive)
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function TexturedQuad(texture, transparent_p) {
  // 2x2 texture
  const width = 2;
  const height = 2;

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

// Creates color array from frequency data
const makeHeatmapColors = (data) => {
  const cm = BlackbodyColormap;

  // TODO: magic constant 255
  const inter = Array.from(data)
    .map((value) => {
      return cm.getColor(value, 0, 10);
    })
    .flat()
    .map((value) => value * 255);
  // Color array (RGBA)
  const colorArray = new Uint8Array(inter);
  return colorArray;
};

// The color overlay for our pixel selection
const makeOverlay = (latticeSize, systemSize) => {
  const inter = [...Array(latticeSize)]
    .map((_, i) => {
      console.log(i);
      console.log("System size: ", systemSize);
      const ret = i - 1 >= systemSize - 1 ? [0, 0, 0, 0] : [0, 0.5, 1, 0.3];
      console.log(ret);
      return ret;
    })
    .flat()
    .map((value) => value * 255);
  // Color array (RGBA)
  const colorArray = new Uint8Array(inter);
  console.log("CLA: ", colorArray);
  return colorArray;
};

function makeStateArray(latticeSize) {
  // Int size in bytes
  const INT_SIZE = 4;

  const arrSize = latticeSize * INT_SIZE;
  const stateArr = new ArrayBuffer(arrSize);
  return new Int32Array(stateArr);
}

// TODO: Component does too many things, consider splitting up
export default function PhysicsCanvas({ data }) {
  const [latticeDims, setLatticeDims] = useState([8, 8]);

  const latticeSize = latticeDims[0] * latticeDims[1];

  const [energyQuanta, setEnergyQuanta] = useState(10);

  // TODO: make this reference a usestate.
  const state = useRef(makeStateArray(latticeSize));

  // TODO: make the accum a state, not a ref

  // deltatime really deltatime, since settimeout will always have some overhead
  const params = useRef({ deltatime: 100, systemSize: latticeSize / 2 });

  // [system size][number of quanta]
  const accumState = useRef(
    Array.from({ length: latticeSize }, () =>
      Array.from({ length: energyQuanta + 1 }, () => 0),
    ),
  );

  const [pdata, setPdata] = useState(
    Array.from(accumState.current[params.current.systemSize - 1]),
  );

  // Create the texture from the array
  const energyTexture = useRef(
    new THREE.DataTexture(
      makeHeatmapColors(state.current),
      latticeDims[0],
      latticeDims[1],
      THREE.RGBAFormat,
    ),
  );

  const overlayTexture = useRef(
    new THREE.DataTexture(
      makeHeatmapColors(state.current),
      latticeDims[0],
      latticeDims[1],
      THREE.RGBAFormat,
    ),
  );

  const cm = BlackbodyColormap;

  let maxind = useRef(0);

  /**
   * @brief Distributes n objects into x boxes, using an even distribution
   *
   * @param n Number of objects
   * @param target Array to keeep the results
   *
   * @return
   */
  function distributeQuanta(n, target) {
    let remainingQuanta = n;
    let x = target.length;

    // zero the array
    for (let i = 0; i < target.length; i++) {
      target[i] = 0;
    }

    // Fill the grid
    for (let i = 0; i < x - 1 && remainingQuanta != 0; i++) {
      // Calculate the probability for the current bin
      const p = 1 / (x - i);
      // Determine the number of quanta in this bin using a binomial distribution
      var dist = binomialDistribution(remainingQuanta, p);
      const randVal = Math.random();

      let quantaInCell = 0;
      for (let j = 0, c = 0.0; j <= remainingQuanta; j++) {
        c += dist[j];
        if (randVal < c) {
          quantaInCell = j;
          break;
        }
      }

      // The rest go into the last bin
      Math.round(remainingQuanta * p);

      target[i] = quantaInCell;
      // Subtract the balls placed in this container from the remaining balls
      remainingQuanta -= quantaInCell;
    }

    // The last container gets all remaining quanta
    target[x - 1] = remainingQuanta;

    /*
    // A dumb (inelegant) solution: randomly pick for each quantum
    for (let i = 0; i < remainingQuanta; i++) {
      let ind = getRandomInt(latticeSize);
      target[ind] += 1;
      //const element = remainingQuanta[i];
    }
    console.log(target);
    */
  }

  distributeQuanta(energyQuanta, state.current);
  const overlayArray = makeOverlay(latticeSize, params.current.systemSize);
  overlayTexture.current.image.data.set(overlayArray);
  overlayTexture.current.needsUpdate = true; // Tell Three.js to update the texture

  useEffect(() => {
    const gui = new dat.GUI();

    var obj = {
      restartSim: function () {
        //setUseKey(useKey + 1);
        state.current = makeStateArray(latticeSize);
        // TODO: extract into function
        accumState.current = Array.from({ length: latticeSize }, () =>
          Array.from({ length: energyQuanta + 1 }, () => 0),
        );
      },
    };

    gui.add(obj, "restartSim", "Restart simulation");

    //gui.add(params.current, "graph update frequency", 10, 1000);
    gui.add(params.current, "deltatime", 10, 1000);
    gui.add(params.current, "systemSize", 1, latticeSize).step(1);
    /*
      .add(valueRef.current, "value", 0, 100)
      .name("Value")
      .onChange((value) => {
        valueRef.current = value;
      });
      */

    return () => {
      gui.destroy();
    };
  }, [latticeSize, energyQuanta]);

  useEffect(() => {
    const simulate = () => {
      distributeQuanta(energyQuanta, state.current);

      const colorArray = makeHeatmapColors(state.current);

      // Creating final array
      let sum = 0;
      // Using map to perform transformations
      let partialSums = state.current.map((e) => {
        sum = sum + e;
        return sum;
      });

      // Keep track of system's configurations
      partialSums.forEach((value, index) => {
        accumState.current[index][value] += 1;
      });

      maxind.current = 0;
      for (let i = 0; i < energyQuanta + 1; i++) {
        if (accumState.current[i] != 0) {
          maxind.current = i;
        }
      }

      energyTexture.current.image.data.set(colorArray);
      energyTexture.current.needsUpdate = true; // Tell Three.js to update the texture

      setPdata(Array.from(accumState.current[params.current.systemSize - 1]));

      //updaterID = requestAnimationFrame(simulate);
      updaterID = setTimeout(simulate, params.current.deltatime);
    };
    let updaterID = setTimeout(simulate, params.current.deltatime);
    //updaterID = setTimeout(simulate, 0);

    return () => {
      //cancelAnimationFrame(updaterID);
      clearTimeout(updaterID);
    };
  }, [latticeSize, energyQuanta]);

  return (
    // TODO: Set bg to a translucent color?
    <>
      <div className="m-auto basis-1/4 ">
        <Canvas
          className="aspect-square  border-stone-600 border-2"
          orthographic
          camera={{
            left: -1,
            right: 1,
            top: 1,
            bottom: -1,
            position: [0, 0, 100],
          }}
        >
          <color attach="background" args={["blue"]} />
          <gridHelper
            args={[10, 10, `white`, `gray`]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <TexturedQuad
            texture={energyTexture.current}
            transparent_p={false}
          ></TexturedQuad>
          <TexturedQuad
            texture={overlayTexture.current}
            transparent_p={false}
            position={[0, 0, 1]}
          ></TexturedQuad>
        </Canvas>
      </div>
      <div className="m-0 basis-full sm:basis-3/5  aspect-[4/3]">
        <Plot
          //className="aspect-w-4 aspect-h-3 w-2/3"
          className="aspect-square w-2/3"
          data={[
            {
              y: pdata,
              type: "bar",
              marker: {
                color: "#FEF08A",
              },
            },
            {
              y: pdata,
              type: "lines",
            },
          ]}
          useResizeHandler={true}
          layout={{
            margin: { l: 40, b: 40, t: 40, r: 40 },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            xaxis: {
              nticks: 5,
              title: { text: maxind.current, standoff: 10 },
              gridcolor: "#444444", // Dark gray grid lines
              zerolinecolor: "#888888", // Dark gray zero line
              color: "#ffffff", // White axis labels and tick marks
              //range: [-0.5, maxind.current + 0.5], // Set the x-axis limits here
            },
            font: {
              color: "#ffffff", // Set the text color to white
            },
            yaxis: {
              title: { text: maxind.current, standoff: 10 },
              gridcolor: "#444444",
              zerolinecolor: "#888888",
              color: "#ffffff",
            },
            legend: {
              x: 1,
              y: 1,
              xanchor: "right",
              yanchor: "top",
              bgcolor: "rgba(255,255,255,0.3)", // Semi-transparent background
            },
          }}
          config={{
            scrollZoom: false,
            editable: false,
            displayModeBar: false,
          }}
          style={{ width: "100%", height: "100%" }}
        />{" "}
      </div>
    </>
  );
}
