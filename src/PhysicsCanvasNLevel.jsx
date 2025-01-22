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
import {stdDev, arrSum, stdDevInd, meanInd} from "./MathUtilities.jsx"
import {Vector3, Vector4} from "three";

import {ArcherContainer, ArcherElement} from 'react-archer';
import HistogramNLevel from "./HistogramNLevel.jsx";

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
const makeLoneSystemColor = (value, N, quanta) => {
    const cm = BlueColormap;
    //return cm.getColor(value, 0, Math.max(N + 1, Math.max(10, 1)));
    return cm.getLogColor(value, 0, Math.max(quanta, 1));
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
    const [DeltaE, setDeltaE] = useState(1);
    const [DeltaEkbT, setDeltaEkbT] = useState(1);
    const [N, setN] = useState(2);


    const latticeSize = latticeDims[0] * latticeDims[1];

    // Average energy of oscillator U=<E> in Einstein solid: -1/Z\parital_\beta Z = DeltaE/2 coth(DeltaE/2kT)
    const energyQuanta = latticeSize * DeltaE/(-1+Math.exp(DeltaEkbT))

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
        DeltaE:1,
        DeltaEkbT:1,
        latticewidth: latticeDims[0],
        energyQuanta: energyQuanta,
    });

    // [system size][number of quanta]
    // Info on each simulation cycle, used for visualization
    const accumState = useMemo(() => {
        if (renderID !== null && latticeDims !== null) {
            return Array.from({length: N}, () =>
                    0,
            );
        }
    }, [renderID, latticeDims, latticeSize, energyQuanta, N]);

    // Array to display on histogram
    const [pdata, setPdata] = useState(Array.from(accumState));

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

    const minind = 0;
    const maxind = N-1;

    /**
     * @brief Distributes n objects into x boxes, using an even distribution
     *
     * @param n Number of objects
     * @param target Array to keeep the results
     *
     * @return
     */
        // TODO: Something's wrong with the first pixel (always 0)
    const distributeQuanta = useCallback(
        (n, target, nSystemTarget) => {
            //let remainingQuanta = n;
            //let x = target.length;

            // zero the array
            for (let i = 0; i < target.length; i++) {
                target[i] = 0;
            }

            // OBSERVE: Round off probabilistically, based on the decimal of the energyQuanta value
            let stars = Math.floor(energyQuanta) + (Math.random() < (energyQuanta - Math.floor(energyQuanta)) ? 1 : 0 );
            // We have one extra system, the N-level system.
            let bars = latticeSize;

            // Fill our lattice according to "stars and bars"
            let index = 0;

            // Quanta in the N-level system
            let NsystemQuanta = 0

            let istars = stars
            let ibars = bars
            const isbsize = stars + bars;

            do {
                NsystemQuanta = 0

                istars = stars
                ibars = bars

                let i = 0
                let bar = false
                while(i < isbsize && !bar){
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
                        ibars -= 1;
                    }
                    i += 1
                }
            }while (NsystemQuanta >= N)

            nSystemTarget.current = NsystemQuanta

            stars = istars
            bars = ibars
            const sbsize = stars + bars;
            index = 0

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

        /*
        gui
            .add(params.current, "latticewidth", 1, 64)
            .step(1)
            .onFinishChange((newValue) => {
                if (!(params.current.systemSize === Math.floor((newValue * newValue) / 2))) {
                    params.current.systemSize = Math.floor((newValue * newValue) / 2);
                    setLatticeDims([newValue, newValue]);
                }
            })
            .name("Heat bath dim.");

         */

        gui.add(params.current, "deltatime", 10, 1000).name("Time step (ms)");

        gui
            .add(params.current, "N", 1, 64)
            .step(1)
            .onFinishChange((newValue) => {
                setN(newValue);
            })
            .name("N");

        gui
            .add(params.current, "DeltaE", 1e-5, 10)
            .onFinishChange((newValue) => {
                setDeltaE(newValue);
            })
            .name("Delta E");

        gui
            .add(params.current, "DeltaEkbT", 1e-2, 10)
            .onFinishChange((newValue) => {
                setDeltaEkbT(newValue);
            })
            .name("DeltaE/kT");
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
                const pdata_pr = accumState;

                const colorArray = makeHeatmapColors(heatBathState, energyQuanta);
                energyTexture.image.data.set(colorArray);
                energyTexture.needsUpdate = true; // Tell Three.js to update the texture

                setPdata(Array.from(pdata_pr));
            }
        };

        // For simulation ("physics") updates
        const simulate = () => {
            distributeQuanta(energyQuanta, heatBathState, nSystemState);
            nSystemColor.current = makeLoneSystemColor(nSystemState.current, N, energyQuanta)

            accumState[nSystemState.current] += 1;

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
        N,
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
                                {`${N}-level system`}
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
                        <HistogramNLevel
                                   idata={pdata}
                                   min_ind={minind}
                                   max_ind={maxind}
                                   flipped={true}
                        />
                        <div className="columns-2">
                            <p className="text-right">
                                {"Mean: "}
                            </p>
                            <p className="text-left">
                                {
                                    meanInd(pdata).toFixed(4)
                                }
                            </p>
                        </div>
                </div>
            </div>
        </>
    );
}
