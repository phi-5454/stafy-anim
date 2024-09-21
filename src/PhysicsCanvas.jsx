import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Canvas} from "@react-three/fiber";
import * as dat from "dat.gui";

import Plot from "react-plotly.js";
import {Plane} from "@react-three/drei";
import BlackbodyColormap from "./ColorGradient";
import * as THREE from "three";
import {bar} from "plotly.js/src/traces/parcoords/constants.js";

import("simple-statistics");

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
const makeHeatmapColors = (data, quanta) => {
  const cm = BlackbodyColormap;

  // TODO: magic constant 255
  const inter = Array.from(data)
    .map((value) => {
      return cm.getLogColor(value, 0, Math.max(quanta, 1));
    })
    .flat()
    .map((value) => value * 255);
  // Color array (RGBA)
  return new Uint8Array(inter);
};

// The color overlay for our pixel selection
const makeOverlay = (latticeSize, systemSize) => {
  const inter = [...Array(latticeSize)]
    .map((_, i) => {
      const ret = i - 1 >= systemSize - 1 ? [0, 0, 0, 0] : [0, 0.5, 1, 0.5];
      return ret;
    })
    .flat()
    .map((value) => value * 255);
  // Color array (RGBA)
  const colorArray = new Uint8Array(inter);
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
  const [renderID, setRenderID] = useState(0);
  const [latticeDims, setLatticeDims] = useState([32,32]);
  const [energyQuanta, setEnergyQuanta] = useState(5000);

  const latticeSize = latticeDims[0] * latticeDims[1];

  const systemState= useMemo(() => {return makeStateArray(latticeSize)}, [latticeSize]);

  // TODO: system flickers...

  // deltatime not really deltatime, since settimeout will always have some overhead
  const params = useRef(
      { deltatime: 100, systemSize: Math.ceil(latticeSize / 2), latticesize: latticeDims[0], energyQuanta: energyQuanta }
  );

  // [system size][number of quanta]
  // Info on each simulation cycle, used for visualization
  const accumState = useMemo( () =>{
    if(renderID !== null && latticeDims !== null){
     return Array.from({ length: latticeSize }, () =>
      Array.from({ length: energyQuanta + 1 }, () => {
        return 0;}),
    ) 
    }
    }, [renderID, latticeDims, latticeSize, energyQuanta]
  );

  // Array to display on histogram
  const [pdata, setPdata] = useState(
    Array.from(accumState[0]),
  );

  // Textures for the system visualization
  // Create the texture from the array
  const energyTexture =
      useMemo(() =>
          new THREE.DataTexture(
              makeHeatmapColors(makeStateArray(latticeSize), 1),
              latticeDims[0],
              latticeDims[1],
              THREE.RGBAFormat,
          )
          , [latticeDims, latticeSize])

  const overlayTexture= useMemo(() => new THREE.DataTexture(
        makeOverlay(latticeSize, makeStateArray(latticeSize)),
        latticeDims[0],
        latticeDims[1],
        THREE.RGBAFormat,
    ), [latticeDims, latticeSize])

  let minind = useRef(0);
  let maxind = useRef(0);

  /**
   * @brief Distributes n objects into x boxes, using an even distribution
   *
   * @param n Number of objects
   * @param target Array to keeep the results
   *
   * @return
   */
  const distributeQuanta = useCallback((n, target) => {
    //let remainingQuanta = n;
    //let x = target.length;

    // zero the array
    for (let i = 0; i < target.length; i++) {
      target[i] = 0;
    }

    let stars = energyQuanta;
    let bars = latticeSize - 1;
    const sbsize = stars + bars;

    // Fill our lattice according to "stars and bars"
    let index = 0;

    for (let i = 0; i < sbsize; i++){
      // Random variable to decide between star and bar.
      let r = Math.random() * (stars + bars);
      // Weighted sampling:
      // Choose star
      if(r <= stars) {
        target[index] += 1;
        stars -= 1;
      }
      // Choose bar
      else {
        index +=1;
        bars -= 1;
      }
    }

    // Stars and bars to partition the quanta (even distribution between microstates)
  }, [energyQuanta, latticeSize]);


  useEffect(() => {
    const gui = new dat.GUI();

    var obj = {
      restartSim: function () {
        //setUseKey(useKey + 1);
        //state.current = makeStateArray(latticeSize);
        setRenderID(renderID + 1);
      },
    };

    gui.add(obj, "restartSim", "Restart simulation");

    gui.add(params.current, "latticesize", 1, 64).step(1).onFinishChange((newValue) => {
      params.current.systemSize = Math.min(params.current.systemSize, newValue * newValue);
      setLatticeDims([newValue, newValue])
    });

    gui.add(params.current, "deltatime", 10, 1000);
    gui.add(params.current, "systemSize", 1, latticeSize).step(1);
    gui.add(params.current, "energyQuanta", 0, 10000).step(1).onFinishChange((newValue) => {
      setEnergyQuanta(newValue)
    });
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
  }, [latticeSize, latticeDims, energyQuanta, accumState, renderID]);


  useEffect(() => {

    const interactiveUpdate = () => {
      // Request the next frame
      threeFrameID = requestAnimationFrame(interactiveUpdate);

      const now = Date.now();
      const delta = now - then;

      // Frame throttling, taken from
      // https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe (21/09/2024)
      if(delta > frameInterval){
        // Adjust for "excess waiting"
        then = now - (delta % frameInterval);
        const pdata_pr = accumState[Math.max(params.current.systemSize - 1, 0)];

        // Compute bounds to render
        for (let i = 0; i < energyQuanta + 1; i++) {
          if (pdata_pr[i] !== 0) {
            maxind.current = i;
          }
        }
        for (let i = energyQuanta; i >= 0; i--) {
          if (pdata_pr[i] !== 0) {
            minind.current = i;
          }
        }

        const colorArray = makeHeatmapColors(systemState, energyQuanta);
        energyTexture.image.data.set(colorArray);
        energyTexture.needsUpdate = true; // Tell Three.js to update the texture


        setPdata(Array.from(pdata_pr));
      }
    }

    const simulate = () => {
      distributeQuanta(energyQuanta, systemState);


      // Creating final array
      let sum = 0;
      // Using map to perform transformations
      let partialSums = systemState.map((e) => {
        sum = sum + e;
        return sum;
      });

      // Keep track of system's configurations
      partialSums.forEach((value, index) => {
        accumState[index][value] += 1;
      });



      //updaterID = requestAnimationFrame(simulate);
      updaterID = setTimeout(simulate, params.current.deltatime);
    };
    // Keep track of update time delta
    let then = Date.now();
    let frameInterval = 1000/24.0;
    let threeFrameID = requestAnimationFrame(interactiveUpdate);

    let updaterID = setTimeout(simulate, params.current.deltatime);
    //updaterID = setTimeout(simulate, 0);

    return () => {
      cancelAnimationFrame(threeFrameID);
      clearTimeout(updaterID);
    };
  }, [latticeSize, energyQuanta, accumState, distributeQuanta, systemState, energyTexture]);


  overlayTexture.image.data.set(makeOverlay(latticeSize, params.current.systemSize));
  overlayTexture.needsUpdate = true;


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
          <color attach="background" args={["black"]} />
          <gridHelper
            args={[10, 10, `white`, `gray`]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <TexturedQuad
            texture={energyTexture}
            transparent_p={false}
          ></TexturedQuad>
          <TexturedQuad
            texture={overlayTexture}
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
              // Take the subset with data on it, for performance reasons
              y: pdata.slice(minind.current, maxind.current + 1),
              x: Array.from({length:(maxind.current + 1 -minind.current)}, (_, i) => i + minind.current),
              type: "bar",
              marker: {
                color: "#FEF08A",
              },
              name: "Number of occurrences"
            },
            /*{
              y: pdata,
              type: "lines",
              name: "Ideal Boltzmann"
            },*/
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
