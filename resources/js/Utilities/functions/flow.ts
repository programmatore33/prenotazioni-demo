export const flow = (fns: Function[], ...args: any) => {
  if (!args.length) return (...args: any) => flow(fns, ...args);
  if (!fns.length) {
    throw new SyntaxError("You must pass at least a function to flow.");
  }
  let params = fns[0](...args);
  for (let index = 1; index < fns.length; index++) {
    const fn = fns[index];
    params = fn(params)
  }
  return params;
};
