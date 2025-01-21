import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {Canvas} from "@react-three/fiber";
import * as dat from "dat.gui";

import {BlackbodyColormap, BlueColormap} from "./ColorGradient";
import * as THREE from "three";
import {bar} from "plotly.js/src/traces/parcoords/constants.js";
import TexturedQuad from "./TexturedQuad.jsx";
import Histogram from "./Histogram.jsx";
import {stdDev, arrSum, stdDevInd} from "./MathUtilities.jsx"
import {Vector3, Vector4} from "three";

import {ArcherContainer, ArcherElement} from 'react-archer';

import("simple-statistics");


// Creates color array from frequency data
const makeHeatmapColors = (data, quanta) => {
    const cm = BlueColormap;

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

// Creates color value for N-level system
// TODO: Make colormap uniform with rest
const makeLoneSystemColor = (value, N) => {
    console.log(value)
    const cm = BlackbodyColormap;
    return cm.getColor(value, 0, Math.max(N + 1, Math.max(10, 1)));
};


function makeStateArray(latticeSize) {
    // Int size in bytes
    const INT_SIZE = 4;

    const arrSize = latticeSize * INT_SIZE;
    const stateArr = new ArrayBuffer(arrSize);
    return new Int32Array(stateArr);
}

// TODO: Component does too many things, consider splitting up
export default function PhysicsCanvasNLevel({data}) {
    const [renderID, setRenderID] = useState(0);
    const [latticeDims, setLatticeDims] = useState([32, 32]);
    const [energyQuanta, setEnergyQuanta] = useState(5000);
    const [N, setN] = useState(10);

    const latticeSize = latticeDims[0] * latticeDims[1];

    const heatBathState = useMemo(() => {
        return makeStateArray(latticeSize);
    }, [latticeSize]);

    // TODO: system flickers...

    const nSystemState = useRef(0)
    const nSystemColor = useRef([0,0,0,0])

    // deltatime not really deltatime, since settimeout will always have some overhead
    const params = useRef({
        deltatime: 100,
        systemSize: 1,
        N:2,
        latticewidth: latticeDims[0],
        energyQuanta: energyQuanta,
    });

    // [system size][number of quanta]
    // Info on each simulation cycle, used for visualization
    const accumState = useMemo(() => {
        if (renderID !== null && latticeDims !== null) {
            return Array.from({length: latticeSize}, () =>
                Array.from({length: energyQuanta + 1}, () => {
                    return 0;
                }),
            );
        }
    }, [renderID, latticeDims, latticeSize, energyQuanta]);

    // Array to display on histogram
    const [pdata, setPdata] = useState(Array.from(accumState[0]));

    // Textures for the system visualization
    // Create the texture from the array
    const energyTexture = useMemo(
        () =>
            new THREE.DataTexture(
                makeHeatmapColors(makeStateArray(latticeSize), 1),
                latticeDims[0],
                latticeDims[1],
                THREE.RGBAFormat,
            ),
        [latticeDims, latticeSize],
    );

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
    const distributeQuanta = useCallback(
        (n, target, nSystemTarget) => {
            //let remainingQuanta = n;
            //let x = target.length;

            // zero the array
            for (let i = 0; i < target.length; i++) {
                target[i] = 0;
            }

            let stars = energyQuanta;
            // We have one extra system, the N-level system.
            let bars = latticeSize;
            const sbsize = stars + bars;

            // Fill our lattice according to "stars and bars"
            let index = 0;

            // Quanta in the N-level system
            let NsystemQuanta = 0

            let istars = stars
            let ibars = bars
            let iindex = index
            do {
                NsystemQuanta = 0

                istars = stars
                ibars = bars
                iindex = index

                let i = 0
                let bar = false
                while(i < sbsize && !bar){
                    // Random variable to decide between star and bar.
                    let r = Math.random() * (istars + ibars);
                    // Weighted sampling:
                    // Choose star
                    if (r <= istars) {
                        NsystemQuanta += 1;
                        istars -= 1;
                    }
                    // Choose bar
                    else {
                        bar = true
                        iindex += 1;
                        ibars -= 1;
                    }
                    i += 1
                }
            }while (NsystemQuanta >= N)

            nSystemTarget.current = NsystemQuanta

            stars = istars
            bars = ibars
            index = iindex

            for (let i = 0; i < sbsize; i++) {
                // Random variable to decide between star and bar.
                let r = Math.random() * (stars + bars);
                // Weighted sampling:
                // Choose star
                if (r <= stars) {
                    target[index] += 1;
                    stars -= 1;
                }
                // Choose bar
                else {
                    index += 1;
                    bars -= 1;
                }
            }

            // Stars and bars to partition the quanta (even distribution between microstates)
        },
        [energyQuanta, latticeSize, N],
    );

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

        gui
            .add(params.current, "latticewidth", 1, 64)
            .step(1)
            .onFinishChange((newValue) => {
                setLatticeDims([newValue, newValue]);
            })
            .name("Heat bath dim.");

        gui.add(params.current, "deltatime", 10, 1000).name("Time step (ms)");

        gui
            .add(params.current, "energyQuanta", 0, 10000)
            .step(1)
            .onFinishChange((newValue) => {
                setEnergyQuanta(newValue);
            })
            .name("Energy quanta");
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

    // For UI updates
    useEffect(() => {
        const interactiveUpdate = () => {
            // Request the next frame
            threeFrameID = requestAnimationFrame(interactiveUpdate);

            const now = Date.now();
            const delta = now - then;

            // Frame throttling, taken from
            // https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe (21/09/2024)
            if (delta > frameInterval) {
                // Adjust for "excess waiting"
                then = now - (delta % frameInterval);
                const pdata_pr = accumState[0];

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

                const colorArray = makeHeatmapColors(heatBathState, energyQuanta);
                energyTexture.image.data.set(colorArray);
                energyTexture.needsUpdate = true; // Tell Three.js to update the texture

                setPdata(Array.from(pdata_pr));
            }
        };

        // For simulation ("physics") updates
        const simulate = () => {
            distributeQuanta(energyQuanta, heatBathState, nSystemState);
            nSystemColor.current = makeLoneSystemColor(nSystemState.current, N)
            console.log(nSystemColor.current)

            // Creating final array
            let sum = 0;
            // Using map to perform transformations
            let partialSums = heatBathState.map((e) => {
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
        let frameInterval = 1000 / 24.0;
        let threeFrameID = requestAnimationFrame(interactiveUpdate);
        //updaterID = setTimeout(simulate, 0);

        let updaterID;
        simulate();

        return () => {
            cancelAnimationFrame(threeFrameID);
            clearTimeout(updaterID);
        };
    }, [
        latticeSize,
        energyQuanta,
        accumState,
        distributeQuanta,
        heatBathState,
        energyTexture,
    ]);

    return (
        // TODO: Set bg to a translucent color?
        // TODO: Move this configuration stuff to other component
        <>
            <div className="flex flex-wrap w-full">
                <ArcherContainer className="m-auto basis-2/5" strokeColor="gray" startMarker={false} endMarker={false}>
                    <div className="flex">
                        <div className="w-1/2">
                            <p className="text-2xl italic text-nowrap">
                                Heat bath
                            </p>
                            <div className="aspect-square">
                                <ArcherElement id="heatbath" relations={[{
                                    targetId: "nlevelsystem",
                                    sourceAnchor: 'middle',
                                    targetAnchor: 'middle',
                                    startMarker: false,
                                    endMarker: false,
                                }]}>
                                    <Canvas
                                        className=" border-stone-600 border-2"
                                        orthographic
                                        camera={{
                                            left: -1,
                                            right: 1,
                                            top: 1,
                                            bottom: -1,
                                            position: [0, 0, 100],
                                        }}
                                    >
                                        {/*TODO: CHANGE THIS, COULD CAUSE SEIZURES*/}
                                        <color attach="background" args={["black"]}/>
                                        <TexturedQuad
                                            texture={energyTexture}
                                            transparent_p={false}
                                        ></TexturedQuad>
                                    </Canvas>
                                </ArcherElement>
                            </div>
                        </div>
                        <div className="w-1/2 ml-auto my-auto">
                            <p className="text-2xl italic text-center text-nowrap">
                                N-level system
                            </p>
                            <div className="aspect-square w-3 m-auto my-2">
                                <ArcherElement id="nlevelsystem">
                                    <Canvas
                                        className="border-stone-600 border-2"
                                        orthographic
                                        camera={{
                                            left: -1,
                                            right: 1,
                                            top: 1,
                                            bottom: -1,
                                            position: [0, 0, 100],
                                        }}
                                    >
                                        <color attach="background" args={nSystemColor.current}/>
                                    </Canvas>
                                </ArcherElement>
                            </div>
                        </div>
                    </div>
                </ArcherContainer>
                <div className="m-auto basis-full sm:basis-1/2 aspect-[4/3]">
                        <Histogram
                                   idata={pdata}
                                   min_ind={minind.current}
                                   max_ind={maxind.current}
                                   flipped={true}
                        />
                        <div className="columns-2">
                            <p className="text-right">
                                {"Standard deviation: "}
                            </p>
                            <p className="text-right">
                                {"Std. dev. relative to number of quanta: "}
                            </p>
                            <p className="text-left">
                                {
                                    stdDevInd(pdata).toFixed(4)
                                }
                            </p>
                            <p className="text-left">
                                {
                                    (stdDevInd(pdata) * ((energyQuanta === 0) ? 0.0 : (1 / energyQuanta))).toExponential(3)
                                }
                            </p>
                        </div>
                </div>
            </div>
        </>
    );
}
