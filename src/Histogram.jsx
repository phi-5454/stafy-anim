import Plot from "react-plotly.js";
import React, {forwardRef} from "react";

const Histogram = ({idata, min_ind, max_ind, flipped=false}) =>{

    const xtitle=flipped?"Number of occurrences":"Number of quanta in the system"
    const ytitle=flipped?"Number of quanta in the system":"Number of occurrences"


    const quantarange = Array.from({length:(max_ind + 1 -min_ind)}, (_, i) => i + min_ind)
    const data = idata.slice(min_ind, max_ind + 1)

    const xdata=flipped?data:quantarange
    const ydata=flipped?quantarange:data

    return(<Plot
        //className="aspect-w-4 aspect-h-3 w-2/3"
        className="aspect-square w-2/3"
        data={[
            {
                // Take the subset with data on it, for performance reasons
                y: ydata,
                x: xdata,
                orientation: (flipped?'h':'v'),
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
            //margin: { l: 40, b: 40, t: 40, r: 40 },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            xaxis: {
                nticks: 5,
                title: { text: xtitle, standoff: 10 },
                gridcolor: "#444444", // Dark gray grid lines
                zerolinecolor: "#888888", // Dark gray zero line
                color: "#ffffff", // White axis labels and tick marks
            },
            font: {
                family: "Garamond, serif",
                size: 15,
                color: "#ffffff", // Set the text color to white
            },
            yaxis: {
                //tickangle:-45,
                title: { text: ytitle, standoff: 10 },
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
    />);

}

export default Histogram;