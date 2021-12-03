export const linerInterpolation = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  x: number
) => {
  if (start.x === end.x && start.x === x) return start.y;
  return start.y + ((end.y - start.y) * (x - start.x)) / (end.x - start.x);
};
