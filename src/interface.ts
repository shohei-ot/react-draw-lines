export type Point = {
  x: number;
  y: number;
  force: number; // 0.0 ~ 1.0
  identifier: number;
};

export type Line = {
  start: Point;
  end: Point;
};

export type CanvasStyle = {
  lineWidth: number;
  strokeStyle: string;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
};

const ROUND = 'round';

export const DEFAULT_CANVAS_STYLE: Readonly<CanvasStyle> = {
  lineWidth: 10,
  lineCap: ROUND,
  lineJoin: ROUND,
  strokeStyle: '#000',
};
