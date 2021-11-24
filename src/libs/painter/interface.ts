export type Point = {
  x: number;
  y: number;
  force?: number; // 0.0 ~ 1.0
};

export type Line = {
  start: Point;
  end: Point;
};

export type OneStroke = {
  start: Point;
  end: Point;
  lines: Line[];
};

export type CanvasStyle = {
  lineWidth: number;
  strokeStyle: string;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
};

const ROUND = 'round';

export const DEFAULT_CANVAS_STYLE: Readonly<CanvasStyle> = {
  lineWidth: 5,
  lineCap: ROUND,
  lineJoin: ROUND,
  strokeStyle: '#000',
};
