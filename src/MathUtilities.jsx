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

export const variance = (arr) => {
  const mu = arr.reduce((sum, value) => sum + value, 0 )/arr.length;
  return arr.reduce((sum, value) => sum + (value - mu) ** 2, 0) / arr.lenth
}

export const stdDev = (arr) =>{
  return Math.sqrt(variance(arr))
}
