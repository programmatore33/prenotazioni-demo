import { curry } from "./curry"
/**
 * Runs fn on item if iteratee(item) is thruthy
 * @param iteratee The test
 * @param item The item to test
 * @param fn The transformer function
 * @returns
 */
export const baseWhen = <T, U>(
  iteratee: (item: T) => boolean,
  fn: (item: T) => U,
  item: T
) => {
  if (iteratee(item)) return fn(item);
  return item;
};

export const when = curry(baseWhen);
