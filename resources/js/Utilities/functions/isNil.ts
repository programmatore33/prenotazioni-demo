/**
 * Returns true if the item is null or undefined
 * @param value The item to check
 * @returns true | false
 */
export const isNil = (value: unknown) => {
  if(typeof value === 'undefined') return true;
  if(value === null) return true;
  return false;
}
