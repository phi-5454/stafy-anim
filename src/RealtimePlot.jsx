import React, { useEffect, useRef } from "react";
import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-basic-dist";
const Plot = createPlotlyComponent(Plotly);

// F this just do it with vanilla, ans useeffect
export default function RealtimePlot({ data }) {
  const plotRef = useRef(null);
  const n = useRef(1);

  let dt = useRef(data);

  //let n = useRef(1);
  useEffect(() => {
    // Initialize the Plotly plot
    Plotly.newPlot(plotRef.current, {
      data: [
        {
          x: [0, 1, 2, 3, 4],
          y: dt.current,
          type: "bar",
        },
      ],
      layout: {
        title: "Dynamic Data Plot",
        yaxis: { range: [0, n.current] },
      },
    });

    let timeout = 100;
    let cont = true;
    function update() {
      n.current = Math.max(...dt.current);

      plotRef.current &&
        Plotly.animate(
          plotRef.current,
          {
            data: [
              {
                y: dt.current,
              },
            ],
            layout: {
              title: "Dynamic Data Plot",
              yaxis: { range: [0, n.current] },
            },
          },

          {
            transition: {
              duration: 0.01,
            },
            frame: {
              duration: 0.01,
              redraw: false,
            },
          },
        );
      cont && requestAnimationFrame(update);
      //cont && setTimeout(update, timeout);
    }
    plotRef.current && update();

    let cc = plotRef.current;
    // Clean up the plot when the component unmounts
    return () => {
      cont = false;
      // TODO: Can be done with animationframeid
      cc && Plotly.purge(cc);
      // Alternatively: clearInterval, cancelAnimationFrame
    };
  });

  return (
    <div>
      <div ref={plotRef} />
    </div>
  );
}
