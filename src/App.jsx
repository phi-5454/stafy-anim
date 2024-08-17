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
# A quantum model for energy in a system
What you see here is a simulation* of a something resembling an **Einstein solid**. Each pixel in the grid (lattice) represents an "energy store". Each such store may hold an integer number of discrete energy packets, **energy quanta**. The number of energy quanta in the whole system remains fixed: the system is **isolated**.

The simulation works in discrete timesteps (You can change the length of this timestep using the **interactive GUI**). At each timestep, all of the energy quanta are independetly, randomly distributed among the pixels in the grid. The colors of the pixels represent the number of quanta in each. The brighter the pixel, the more quanta.

In this isolated system, a subset of pixels is highlighted in *blue*. Let's call this a **subsystem**, the properties of which we'll be particularly interested in.

Once the quanta have been distributed, a record of this distribution is created. The histogram then displays the abundances of energy configurations, over all of these simulated allotments of quanta. 

Amuse yourself with trying to change the differnt parameter of the simulation, using the **interactive GUI**. For instance, try to shrink the size of the system. What do you think will happen to the distribution?

\\* This specific type of statistical simulation is called a Monte-Carlo simulation
\\* Note that when talking about canonical ensembles, what we call the "system" would correspond to our subsystem, and the "surroundings" to the rest of the greater system. In our case, this pixel grid is only an approximation, as 


## The canonical ensemble

## A historical perspective

## Ultraviolet catastrophe 
It is said that 


## The physical basis

What you see above is a simplified Einstein solid.

# The Boltzmann distribution
This simulation aims to illustrate a simple result: A Boltzmann distribution arises 
from a purely combinatorial basis, when our system is similar enough to a system of a canonical ensemble.

It plays a fundameltal role in thermal physics.

In words, the distribution arises from purely combinatorial 

Its domain of validity.

Of course, it is not the be-all-end-all of thermal distributions. You will come to learn of the conditions where the Boltzmann distribution breaks down, and of models that more accurately describe these cases, such as the **Fermi-Dirac** and **Bose-Einstein** distributions for dense, low temperature gases.

## Try the limits
At this limit, our system behaves in accordance to a **canonical ensemble**.

### A lesson in combinatorics 
It seems that no matter how many energy quanta we have, the ground state is always the likeliest. Why is this?
Why is it the case, that the ground state is the likeliest?

We could ask the question: Given a single cell, how many quanta should we give it to maximize the number of ways we can distribute the rest of the quanta to the other cells? Here, we only need choose one number, the number of quanta to set on the cell, that is to say, we "fix" one degree of freedom regardless of what choice we make. 

If we choose 0, we can choose any of the remaining cells for any given energy quantum. When selecting one or more, however, the number of quanta for which we make this choice will be smaller, in turn, yielding a smaller number of ways we can distribute them. \
We say that the choice of 0 quanta **maximizes the multiplicity** of the system.
\
### Degrees of freedom
In general, a degree of freedom corresponds to a choice that one could make when configuring a physical system. The term is well-applicable in the microformalism of state, as the "choices" we can make directly correspond to the properties of single particles (in this case, the positions of the quanta).
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
  const cm = BlackbodyColormap;
  return (
    //<div className="w-screen h-screen fixed top-0 left-0">
    <div className="w-full m-auto">
      <div className="flex flex-wrap w-4/5 justify-center p-0 m-auto align-middle">
        <PhysicsCanvas />
      </div>
      <div className="m-auto justify-center w-3/5 py-5">
        <Markdown className="prose prose-xl font-serif prose-invert m-auto">
          {bbbbb}
        </Markdown>
      </div>
    </div>
  );
}

export default App;
