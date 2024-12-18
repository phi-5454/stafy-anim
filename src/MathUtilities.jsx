import colormap from "colormap";
import {overloadingFn} from "three/src/nodes/utils/FunctionOverloadingNode.js";

export const variance = (arr) => {
    const mu = arrSum(arr) / arr.length;
    return arr.reduce((sum, value) => sum + (value - mu) ** 2, 0) / arr.length
}

export const stdDev = (arr) => {
    return Math.sqrt(variance(arr))
}

// Standard deviation of the index
export const varianceInd = (arr) => {
    // the PDF of the indices
    const setsum = arrSum(arr)
    if(setsum === 0) return 0
    const indPDF = arr.map((v, i) => v / setsum)
    // average index
    const mu = arrSum(indPDF.map((v, i) => v * i));
    const offsetSquare = indPDF.map((x, i) => x * (i - mu) ** 2);
    return arrSum(offsetSquare);
}
// Standard deviation on the index
export const stdDevInd = (arr) => {
    return Math.sqrt(varianceInd(arr))
}

export const arrSum = (arr) => {
    return arr.reduce((sum, value) => sum + value, 0)
}

// get random in [0, max) (exclusive)
export const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}
