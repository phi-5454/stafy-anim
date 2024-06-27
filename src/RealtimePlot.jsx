import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist";

import Plot from "react-plotly.js";

// F this just do it with vanilla, ans useeffect
export default function RealtimePlot({ data }) {
  const plotRef = useRef(null);

  useEffect(() => {
    // Initialize the Plotly plot
    Plotly.newPlot(plotRef.current, {
      data: [
        {
          y: data,
          type: "histogram",
        },
      ],
      layout: { title: "Dynamic Data Plot" },
    });

    function update() {
      Plotly.animate(
        plotRef,
        {
          data: [{ y: data }],
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
      requestAnimationFrame(update);
    }

    // Clean up the plot when the component unmounts
    return () => {
      Plotly.purge(plotRef.current);
    };
  }, []);

  useEffect(() => {
    // Update the Plotly plot with new data when `data` prop changes
    Plotly.react(plotRef.current, {
      data: [
        {
          y: data,
          type: "histogram",
        },
      ],
      layout: { title: "Dynamic Data Plot" },
    });
  }, [data]);

  return (
    <div>
      <div ref={plotRef} />
    </div>
  );
}
