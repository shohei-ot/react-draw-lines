import { Line, Point } from './interface';

export const pointsToLines = (points: Point[]): Line[] => {
  const lines: Line[] = [];
  const lineNum = points.length - 1;
  for (let i = 0; i < lineNum; i++) {
    const startPointIndex = i;
    const endPointIndex = i + 1;
    const start = points[startPointIndex];
    const end = points[endPointIndex];
    lines.push({ start, end });
  }
  return lines;
};
