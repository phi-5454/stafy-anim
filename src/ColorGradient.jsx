import colormap from "colormap";

class ColorGradient {
  constructor(props) {
    this.colors = colormap(props);

    this.getColor = (value, min, max) => {
      const index = Math.floor(
        ((value - min) / (max - min)) * (this.colors.length - 1),
      );
      return this.colors[index];
    };

    this.getLogColor = (value, min, max) => {
      // Apply logarithmic transformation to the value
      const logMin = Math.log(min + 1); // Adding 1 to avoid log(0)
      const logMax = Math.log(max + 1);
      const logValue = Math.log(value + 1);

      const index = Math.floor(
        ((logValue - logMin) / (logMax - logMin)) * (this.colors.length - 1),
      );
      return this.colors[index];
    };
  }
}

// A ready-made object
const BlackbodyColormap = new ColorGradient({
  colormap: "hot",
  nshades: 100,
  format: "float",
  alpha: 1,
});

const BlueColormap = new ColorGradient({
  colormap: "bone",
  nshades: 100,
  format: "float",
  alpha: 1,
});

export {BlackbodyColormap, BlueColormap};
