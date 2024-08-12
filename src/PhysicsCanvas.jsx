import React, { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import Plotly from "plotly.js-dist";
import * as dat from "dat.gui";

import Plot from "react-plotly.js";
import RealtimePlot from "./RealtimePlot";
import { Plane } from "@react-three/drei";
import BlackbodyColormap from "./ColorGradient";
import { binomialDistribution } from "simple-statistics";
import("simple-statistics");

// get random in [0, max) (exclusive)
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function makeStateArray(latticeSize) {
  // Int size in bytes
  const INT_SIZE = 4;

  const arrSize = latticeSize * INT_SIZE;
  const stateArr = new ArrayBuffer(arrSize);
  return new Int32Array(stateArr);
}

// TODO: Component does too many things, consider splitting up
export default function PhysicsCanvas({ data }) {
  const [pdata, setPdata] = useState([]);
  const [latticeDims, setLatticeDims] = useState([8, 8]);

  const latticeSize = latticeDims[0] * latticeDims[1];

  const [energyQuanta, setEnergyQuanta] = useState(10);
  const [useKey, setUseKey] = useState(0);
  const [latticeState, setLatticeState] = useState(makeStateArray(latticeSize));

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

  useEffect(() => {
    const gui = new dat.GUI();

    var obj = {
      restartSim: function () {
        //setUseKey(useKey + 1);
        console.log("clicked");
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
  }, [latticeSize, useKey]);

  useEffect(() => {
    const simulate = () => {
      distributeQuanta(energyQuanta, state.current);

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

      /*
      let sum = a.slice(0, systemSize).reduce((acc, curr) => {
        return acc + curr;
      });
      */

      //a.forEach((value) => (bins[value - 1] += 1));

      // New entry to our histogram

      //accumState.current[partialSums[systemSize]] += 1;

      maxind.current = 0;
      for (let i = 0; i < energyQuanta + 1; i++) {
        if (accumState.current[i] != 0) {
          maxind.current = i;
        }
      }

      setPdata(Array.from(accumState.current[params.current.systemSize - 1]));

      //updaterID = requestAnimationFrame(simulate);
      updaterID = setTimeout(simulate, params.current.deltatime);
    };
    let updaterID = setTimeout(simulate, params.current.deltatime);
    //updaterID = setTimeout(simulate, 0);

    return () => {
      //cancelAnimationFrame(updaterID);
      console.log("aaAA");
      clearTimeout(updaterID);
    };
  }, [latticeSize, energyQuanta, useKey]);

  return (
    <div>
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
      <Plot
        data={[
          {
            y: pdata,
            type: "bar",
          },
          {
            y: pdata,
            type: "lines",
          },
        ]}
        layout={{
          xaxis: {
            title: maxind.current,
            //range: [-0.5, maxind.current + 0.5], // Set the x-axis limits here
          },
        }}
        config={{ scrollZoom: false, editable: false, displayModeBar: false }}
      />{" "}
    </div>
  );
}
