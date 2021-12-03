import { Point } from '../../../../interface';
import {
  Coordinate,
  getBetweenCoordsForTest,
  pressureInterpolationForTest,
} from '../curve-interpolation';

describe('curve-interpolation', () => {
  test('pressureInterpolationFortest', () => {
    const start: Point = {
      x: 0,
      y: 0,
      force: 1,
      identifier: 1,
    };
    const end: Point = {
      x: 10,
      y: 10,
      force: 0.2,
      identifier: 1,
    };
    const coords: [number, number][] = [
      [2, 2],
      [4, 4],
      [6, 6],
      [8, 8],
    ];

    const res = pressureInterpolationForTest(start, end, coords);

    const expected: Point[] = [
      {
        x: 2,
        y: 2,
        force: 0.84,
        identifier: start.identifier,
      },
      {
        x: 4,
        y: 4,
        force: 0.68,
        identifier: start.identifier,
      },
      {
        x: 6,
        y: 6,
        force: 0.52,
        identifier: start.identifier,
      },
      {
        x: 8,
        y: 8,
        force: 0.36,
        identifier: start.identifier,
      },
    ];

    expect(res.length).toBe(expected.length);
    for (let i = 0; i < res.length; i++) {
      expect(res[i]).toEqual(expect.objectContaining(expected[i]));
    }
  });

  test('getBetweenCoords', () => {
    // 検索元 coordinates
    const coords: Coordinate[] = [
      [0, 0],
      [100, 100],
      [10, 10],
      [20, 20],
      [30, 30],
      [40, 40],
      [50, 50],
      [60, 60],
      [70, 70],
      [80, 80],
      [90, 90],
      [100, 100],
      [110, 110],
      [120, 120],
      [130, 130],
      [140, 140],
      [130, 130],
      [120, 120],
      [110, 110],
      [100, 100],
      [130, 130],
      [120, 120],
    ];

    /**
     * #1
     */
    const start1: Coordinate = [10, 10];
    const end1: Coordinate = [100, 100];
    const startIndexOfCoords1 = 0;

    const res1 = getBetweenCoordsForTest(
      coords,
      start1,
      end1,
      startIndexOfCoords1
    );
    const [res1Coords, res1EndIndex] = res1;

    const expected1: [Coordinate[], number] = [
      [
        [20, 20],
        [30, 30],
        [40, 40],
        [50, 50],
        [60, 60],
        [70, 70],
        [80, 80],
        [90, 90],
      ],
      11,
    ];
    const expected1Coords = expected1[0];
    const expected1EndIndex = expected1[1];

    console.debug('expected1', expected1);
    console.debug('res1', res1);

    // 検証

    // end index
    expect(res1EndIndex).toEqual(expected1EndIndex);

    // coords number
    expect(res1Coords.length).toEqual(expected1Coords.length);

    for (let i = 0; i < res1Coords.length; i++) {
      const resCoord = res1Coords[i];
      const [x, y] = resCoord;
      const expCoord = expected1Coords[i];
      const [expcX, expcY] = expCoord;
      expect(x).toEqual(expcX);
      expect(y).toEqual(expcY);
    }

    /**
     * #2
     */

    const start2: Coordinate = [100, 100];
    const end2: Coordinate = [100, 100];
    const startIndexOfCoords2 = 2;

    const res2 = getBetweenCoordsForTest(
      coords,
      start2,
      end2,
      startIndexOfCoords2
    );
    const [res2Coords, res2EndIndex] = res2;

    const expected2: [Coordinate[], number] = [
      [
        [110, 110],
        [120, 120],
        [130, 130],
        [140, 140],
        [130, 130],
        [120, 120],
        [110, 110],
      ],
      19,
    ];
    const expected2Coords = expected2[0];
    const expected2EndIndex = expected2[1];

    console.debug('expected2', expected2);
    console.debug('res2', res2);

    // 検証

    // end index
    expect(res2EndIndex).toEqual(expected2EndIndex);

    // coords number
    expect(res2Coords.length).toEqual(expected2Coords.length);

    for (let i = 0; i < res2Coords.length; i++) {
      const resCoord = res2Coords[i];
      const [x, y] = resCoord;
      const expCoord = expected2Coords[i];
      const [expcX, expcY] = expCoord;
      expect(x).toEqual(expcX);
      expect(y).toEqual(expcY);
    }
  });
});
