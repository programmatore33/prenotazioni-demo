/*
Maps the keys of an object.
Iteratee is run with value, key, object as arguments

*/
export const mapKeys = <T extends { [key: string]: any }>(
  obj: T,
  fn: (v: unknown, k: keyof T, o: T) => string
): { [key: string]: T[keyof T] } =>
  (Object.keys(obj) as (keyof T)[]).reduce((acc, k) => {
    acc[fn(obj[k], k, obj)] = obj[k];
    return acc;
  }, {} as { [key: string]: T[keyof T] });
