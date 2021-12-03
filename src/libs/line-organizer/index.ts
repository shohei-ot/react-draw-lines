import { Point } from '../../interface';
import { curveInterpolation } from './interpolation/curve-interpolation';

export const lineOrganizer = (
  points: Point[],
  enablePressure = false
): Point[] => {
  return curveInterpolation(points);
};
