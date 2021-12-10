import { CanvasDrawingStyle, Point } from '../../interface';

export const pointsRenderer = (
  ctx: CanvasRenderingContext2D,
  styles: CanvasDrawingStyle,
  points: Point[],
  usePressure = false
): void => {
  if (points.length === 0) return;

  setCommonStyles(ctx, styles);
  drawLineFromPoints(ctx, styles, points, usePressure);
};

export const lineRenderer = (
  ctx: CanvasRenderingContext2D,
  styles: CanvasDrawingStyle,
  points: Point[],
  usePressure = false
): void => {
  setCommonStyles(ctx, styles);

  if (points.length > 2) {
    drawCurvesFromManyPoints(ctx, styles, points, usePressure);
  } else {
    drawLineFromPoints(ctx, styles, points, usePressure);
  }
};

const setCommonStyles = (
  ctx: CanvasRenderingContext2D,
  styles: CanvasDrawingStyle
) => {
  const { lineCap, lineJoin, strokeStyle } = styles;
  ctx.lineCap = lineCap;
  ctx.lineJoin = lineJoin;
  ctx.strokeStyle = strokeStyle;
};

const genRealLineWidth = (
  lineWidth: number,
  minLineWidth: number,
  force: number,
  usePressure: boolean
): number => {
  const calcedLineWidth = lineWidth * (usePressure ? force || 1 : 1);
  const realLineWidth =
    calcedLineWidth > minLineWidth ? calcedLineWidth : minLineWidth;
  return realLineWidth;
};

const drawCurvesFromManyPoints = (
  ctx: CanvasRenderingContext2D,
  styles: CanvasDrawingStyle,
  points: Point[],
  usePressure: boolean
) => {
  if (points.length < 3)
    throw new Error(
      `Too few points. Require 3+ points. (Received points: ${points.length})`
    );

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 2; i++) {
    const currentPoint = points[i];
    const { x: cX, y: cY, force } = currentPoint;

    const nextPoint = points[i + 1];
    const { x: nX, y: nY } = nextPoint;

    const xc = (cX + nX) / 2;
    const yc = (cY + nY) / 2;

    ctx.lineWidth = genRealLineWidth(
      styles.lineWidth,
      styles.minLineWidth,
      force,
      usePressure
    );

    ctx.quadraticCurveTo(cX, cY, xc, yc);
  }

  ctx.quadraticCurveTo(
    points[points.length - 2].x,
    points[points.length - 2].y,
    points[points.length - 1].x,
    points[points.length - 1].y
  );

  ctx.stroke();
};

const drawLineFromPoints = (
  ctx: CanvasRenderingContext2D,
  styles: CanvasDrawingStyle,
  points: Point[],
  usePressure: boolean
) => {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length; i++) {
    const { x, y, force } = points[i];
    ctx.lineWidth = genRealLineWidth(
      styles.lineWidth,
      styles.minLineWidth,
      force,
      usePressure
    );
    ctx.lineTo(x, y);
  }

  ctx.stroke();
};
