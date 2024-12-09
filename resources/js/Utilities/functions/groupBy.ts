/**
 * Creates an object with keys corresponding to the return value of iteratee and values correspond to arrays of items
 */

export const groupBy = <T>(
  arr: T[],
  iteratee: (item: T, index: number, arr: T[]) => string | number | symbol
): Record<ReturnType<typeof iteratee>, T[]> => {
  return arr.reduce(
    (acc: { [key: ReturnType<typeof iteratee>]: T[] }, curr, index, arr) => {
      const key = iteratee(curr, index, arr);
      if (!(key in acc)) {
        acc[key] = [];
      }
      acc[key].push(curr);
      return acc;
    },
    {}
  );
};
