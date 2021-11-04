export type CanvasStyle = {
  lineWidth: number;
  strokeStyle: string;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
};

export type Point = {
  x: number;
  y: number;
  force?: number; // 0.0 ~ 1.0
};

export type Line = {
  start: Point;
  end: Point;
};

export type Stroke = {
  startX: number;
  startY: number;
  startForce?: number;
  endX: number;
  endY: number;
  endForce?: number;
  lines: Line[];
};

export const DEFAULT_CANVAS_STYLE: Readonly<CanvasStyle> = {
  lineWidth: 5,
  lineCap: 'round',
  lineJoin: 'round',
  strokeStyle: '#000',
};
