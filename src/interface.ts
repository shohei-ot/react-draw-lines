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

export type CanvasDrawingStyle = {
  lineWidth: number;
  minLineWidth: number;
  strokeStyle: string;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
};

export type MappedConst<T extends string> = { [key in T]: key };

export type DrawEvent =
  | React.MouseEvent<HTMLCanvasElement, MouseEvent>
  | React.TouchEvent<HTMLCanvasElement>;

export interface IDrawLineHandle {
  eraseAllCanvas(): void;
}

export type CanvasLayerName = 'DRAWING_HISTORY' | 'TMP' | 'USER_INTERFACE';
