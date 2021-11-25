// export type Point = {
//   x: number;
//   y: number;
//   force?: number; // 0.0 ~ 1.0
// };

import { Line, Point } from '../interface';

// export type Line = {
//   start: Point;
//   end: Point;
// };

export type OneStroke = {
  start: Point;
  end: Point;
  lines: Line[];
};
