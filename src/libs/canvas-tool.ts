export const clearCanvas = (
  ctxs: CanvasRenderingContext2D[],
  w: number,
  h: number
) => ctxs.forEach((ctx) => ctx.clearRect(0, 0, w, h));
