import { clamp } from "./clamp";

/**
 * Get the percentage "a" represents in total
 * @returns
 */
export const getAsPercentage = (a: number, total: number) => (a * 100) / total;
/**
 * Get "a" knowing the percentage
 * @returns
 */
export const getPercentageFrom = (a: number, total: number) =>
  (a / 100) * total;

/**
 * Normalize the bounds of a value
 */
export const getAsPercentageBetween = (a: number, min: number, max: number) =>
  getAsPercentage(a - min, max - min);

  /**
 * Get a value "b" that is the same percentage as "a" into it's target bounds.
 * EG 40% = 4 for a bound 0, 10 is transposed to 40% = 8
 * for bounds 0, 20, or again 40% = 4 for bound 10, 20
 */
type TransposeValueParameters = {
    value: number,
    originalBounds: {
        min: number,
        max: number
    },
    targetBounds: {
        min: number,
        max: number
    },
    step: number
}
export const transposeValue: (params: TransposeValueParameters) => number = ({
    value = 0,
    originalBounds,
    targetBounds,
    step = 1,
}) => {
    const percentageOfOriginal = getAsPercentageBetween(
        value,
        originalBounds.min,
        originalBounds.max
    );
    const transposedValue = getPercentageFrom(
        percentageOfOriginal,
        targetBounds.max - targetBounds.min
    );
    const adjusted = transposedValue + targetBounds.min;
    const withStep = Math.round(adjusted / step) * step;
    
    const clamped = clamp(withStep, targetBounds.min, targetBounds.max);
    return clamped;
};