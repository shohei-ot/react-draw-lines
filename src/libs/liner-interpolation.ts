import { Point } from '../interface';

type XyPoint = {
  x: number;
  y: number;
};

const PRESSURE_STEP_NUM = 0.1;

export const linerInterpolationByPressure = (
  start: Point,
  end: Point
): Point[] => {
  const result: Point[] = [];

  const noNeedInterpolation =
    typeof start.force === 'undefined' || typeof end.force === 'undefined';

  if (noNeedInterpolation) {
    result.push(start);
    result.push(end);
    return result;
  }

  const startX = start.x;
  const startForce = start.force!;

  const endX = end.x;
  const endForce = end.force!;

  const xSign = Math.sign(endX - startX);

  const forceSign = Math.sign(endForce - startForce);
  const loopNum = getLoopNumFromPressure(startForce, endForce);

  const xDiff = (endX - startX) * xSign;
  const xStep = xDiff / loopNum;

  result.push(start);
  for (let i = 0; i < loopNum; i++) {
    const nextX = xStep * (1 + i) * xSign + startX;
    const nextY = linerInterpolation(start, end, nextX);
    const nextPressure =
      Math.round((PRESSURE_STEP_NUM * (1 + i) * forceSign + startForce) * 10) /
      10;
    const nextPoint: Point = { x: nextX, y: nextY, force: nextPressure };
    result.push(nextPoint);
  }
  result.push(end);

  return result;
};

const linerInterpolation = (start: XyPoint, end: XyPoint, x: number) => {
  return start.y + ((end.y - start.y) * (x - start.x)) / (end.x - start.x);
};

const getLoopNumFromPressure = (startPress: number, endPress: number) => {
  const pressSign = Math.sign(endPress - startPress);
  const adding = PRESSURE_STEP_NUM;
  const diff = Math.abs(endPress - startPress);
  return Math.abs(Math.round((diff * pressSign) / adding));
};
