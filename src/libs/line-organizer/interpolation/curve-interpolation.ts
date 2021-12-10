import { CurveInterpolator } from 'curve-interpolator';
import { Point } from '../../../interface';

export type Coordinate = [number, number];

export const curveInterpolation = (points: Point[]): Point[] => {
  // console.debug('> START curveInterpolation');
  // console.debug('points', points);
  const flatPoints: Coordinate[] = [];

  for (let i = 0; i < points.length; i++) {
    const { x, y } = points[i];
    flatPoints.push([x, y]);
  }

  const interpolator = new CurveInterpolator(flatPoints, { tension: 0.2 });
  const curvedPoints: Coordinate[] = interpolator.getPoints();

  const pressureRestoredPoints = restorePressuresToCurvedPoints(
    points,
    curvedPoints
  );

  // console.debug('> END curveInterpolation');
  return pressureRestoredPoints;
};

// curve interpolation された points に筆圧を持たせる
const restorePressuresToCurvedPoints = (
  origPoints: Point[],
  curvedCors: Coordinate[]
): Point[] => {
  // origPoints の連続した 2 つの Point を start, end として, curvedCors からその 2 点の index を取り, 2 点間の Coordinate を抽出する.
  const pressureRestoredPoints: Point[] = [];

  let searchIndex = 0;
  for (let i = 0; i < origPoints.length; i++) {
    if (i === 0) continue;

    const prevPoint = origPoints[i - 1];
    const currentPoint = origPoints[i];

    // console.debug({ origPoints, curvedCors, prevPoint, currentPoint });

    // end に一番近い座標を curvedCors から取得したい. 開始位置を指定して一番最初に見つかった座標を end と同一とみなす.
    const [betweenCoords, endIndex] = getCoordsBetween(
      curvedCors,
      [prevPoint.x, prevPoint.y],
      [currentPoint.x, currentPoint.y],
      searchIndex
    );
    searchIndex = endIndex;

    const pressureInterpolatedPoints = pressureInterpolation(
      prevPoint,
      currentPoint,
      betweenCoords
    );

    pressureRestoredPoints.push(prevPoint);
    pressureRestoredPoints.push(...pressureInterpolatedPoints);
    pressureRestoredPoints.push(currentPoint);
  }

  return pressureRestoredPoints;
};

const ROUND_UNIT = 1000;

const pressureInterpolation = (
  start: Point,
  end: Point,
  betweenCoords: Coordinate[]
): Point[] => {
  const startPress = start.force;
  const endPress = end.force;
  const diff = endPress - startPress;
  const step = diff / (betweenCoords.length + 1);

  // console.debug({ startPress, endPress, diff, step });

  const tmp: Point[] = [];
  for (let i = 0; i < betweenCoords.length; i++) {
    const [x, y] = betweenCoords[i];
    const rawForce = startPress + (i + 1) * step;
    const force = Math.round(rawForce * ROUND_UNIT) / ROUND_UNIT;
    const p: Point = {
      x,
      y,
      identifier: start.identifier,
      force,
    };
    tmp.push(p);
  }

  return tmp;
};

export const pressureInterpolationForTest = pressureInterpolation;

type Index = number;
const getNearestCoordIndex = (
  coords: Coordinate[],
  target: Coordinate,
  startIndexOfCoords: number
): Index => {
  // console.group('getNearestCoordIndex');
  // point に対して最短のユークリッド距離を出せる座標の配列 index を返す
  let nearestDistance: number | null = null;
  let nearestPointIndex: number | null = null;
  // let nearestCoordinate: null | [number, number] = null;

  const [targetX, targetY] = target;
  for (let i = 0; i < coords.length; i++) {
    if (startIndexOfCoords > i) continue;

    const [x, y] = coords[i];

    if (targetX === x && targetY === y) {
      nearestPointIndex = i;
      break;
    }

    const distance = Math.sqrt(targetX * x + targetY * y);

    // console.debug({ distance, coord: [x, y], target: [targetX, targetY] });

    if (nearestDistance === null || nearestDistance > distance) {
      nearestDistance = distance;
      nearestPointIndex = i;
      // nearestCoordinate = [x, y];
    }
  }

  if (nearestPointIndex === null) {
    throw new Error('nearestPointIndex が null');
  }

  // console.table({ nearestDistance, nearestPointIndex });

  // console.groupEnd();
  return nearestPointIndex;
};

export const getNearestCoordIndexForTest = getNearestCoordIndex;

/**
 * start と end の間にある座標の配列と, 見つかった end の index を返す. 戻り値に start と end は含まない.
 */
const getCoordsBetween = (
  coords: Coordinate[],
  start: Coordinate,
  end: Coordinate,
  startIndexOfCoords = 0
): [Coordinate[], number] => {
  const funcName = 'getBetweenCoords';
  if (coords.length < 2) throw new Error('coords は 2 つ以上でないといけない');
  console.group(funcName);

  // console.debug({ coords, start, end, startIndexOfCoords });

  // console.group('startIndex');
  const startIndex = getNearestCoordIndex(coords, start, startIndexOfCoords);
  // console.groupEnd();

  // console.group('endIndex');
  const endIndex = getNearestCoordIndex(coords, end, startIndex);
  // console.groupEnd();

  console.debug(`> ${funcName}`, {
    startIndexOfCoords,
    start,
    end,
    startIndex,
    endIndex,
  });

  const tmp: Coordinate[] = [];
  for (let i = startIndex + 1; i < coords.length; i++) {
    if (i < endIndex) tmp.push(coords[i]);
    else break;
  }

  console.groupEnd();
  return [tmp, endIndex];
};

export const getCoordsBetweenForTest = getCoordsBetween;
