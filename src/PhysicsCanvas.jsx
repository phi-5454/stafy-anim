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

// TODO: Component does too many things, consider splitting up
export default function PhysicsCanvas({ data }) {
  const [pdata, setPdata] = useState([]);
  const [latticeDims, setLatticeDims] = useState([8, 8]);
  const [energyQuanta, setEnergyQuanta] = useState(10);

  // The size of the "system" we're observing
  const systemSize = 3;

  // Int size in bytes
  const INT_SIZE = 4;

  const entries = latticeDims[0] * latticeDims[1];
  const arrSize = entries * INT_SIZE;
  const stateArr = new ArrayBuffer(arrSize);

  const state = useRef(new Int32Array(stateArr));

  const accumState = useRef(
    Array.from({ length: entries }, () =>
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

    for (let i = 0; i < target.length - 1; i++) {
      // Calculate the probability for the current bin
      const p = 1 / (x - i);
      // Determine the number of quanta in this bin using a binomial distribution
      var dist = binomialDistribution(remainingQuanta, p);
      //console.log("DIST: " + dist);
      const randVal = Math.random();

      let quantaInCell = 0;
      for (let j = 0, c = 0.0; j < remainingQuanta; j++) {
        c += dist[j];
        if (randVal < c) {
          quantaInCell = j;
          break;
        }
      }

      Math.round(remainingQuanta * p);

      target[i] = quantaInCell;
      // Subtract the balls placed in this container from the remaining balls
      remainingQuanta -= quantaInCell;
      //console.log(remainingQuanta);
    }

    // The last container gets all remaining balls
    target[target.length - 1] = remainingQuanta;
  }

  distributeQuanta(energyQuanta, state.current);
  //console.log(phaseState.current, " asdlkjfölsaföjdljlsajföl");

  const valueRef = useRef({ value: 10 }); // Mutable reference to the value
  useEffect(() => {
    const gui = new dat.GUI();
    gui.add(valueRef.current, "value", 0, 100);
    /*
      .add(valueRef.current, "value", 0, 100)
      .name("Value")
      .onChange((value) => {
        valueRef.current = value;
        console.log("Value updated to:", valueRef.current);
      });
      */

    return () => {
      gui.destroy();
    };
  }, []);

  const interval = 500;
  useEffect(() => {
    let anID;
    const simulate = () => {
      distributeQuanta(energyQuanta, state.current);

      // Creating final array
      let sum = 0;
      // Using map to perform transformations
      let partialSums = state.current.map((e) => {
        sum = sum + e;
        return sum;
      });

      //console.log("ACCUMB: ", accumState.current);
      partialSums.forEach((value, index) => {
        accumState.current[index][value] += 1;
      });
      //console.log("PART: ", partialSums);
      //console.log("ACCUM: ", accumState.current[systemSize]);

      /*
      let sum = a.slice(0, systemSize).reduce((acc, curr) => {
        return acc + curr;
      });
      */

      //a.forEach((value) => (bins[value - 1] += 1));

      // New entry to our histogram

      //accumState.current[partialSums[systemSize]] += 1;

      maxind.current = 0;
      for (let i = 0; i < accumState.current[systemSize].length; i++) {
        if (accumState.current[i] != 0) {
          maxind.current = i;
        }
      }

      setPdata(Array.from(accumState.current[1]));
      //console.log("Current acumstate ", accumState.current);

      //anID = requestAnimationFrame(simulate);
      anID = setTimeout(simulate, interval);
    };
    simulate();

    return () => {
      //cancelAnimationFrame(anID);
      clearInterval(anID);
    };
  }, [entries, energyQuanta]);

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
        ]}
        layout={{
          xaxis: {
            title: "X Axis",
            range: [-0.5, maxind.current + 0.5], // Set the x-axis limits here
          },
        }}
        config={{ scrollZoom: false, editable: false, displayModeBar: false }}
      />{" "}
    </div>
  );
}
/*
 *
      <RealtimePlot data={phaseState.current} />
 * */
