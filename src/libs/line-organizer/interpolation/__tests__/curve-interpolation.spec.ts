import { Point } from '../../../../interface';
import {
  Coordinate,
  getCoordsBetweenForTest,
  getNearestCoordIndexForTest,
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

  describe('getNearestCoordIndex', () => {
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

    test('#1: 0,0 index=0', () => {
      const target: Coordinate = [0, 0];
      const startIndexOfCoords = 0;

      const expected = 0;

      const res = getNearestCoordIndexForTest(
        coords,
        target,
        startIndexOfCoords
      );

      expect(res).toEqual(expected);
    });

    test('#2: 100,100 index=0', () => {
      const target: Coordinate = [100, 100];
      const startIndexOfCoords = 0;

      const expected = 1;

      const res = getNearestCoordIndexForTest(
        coords,
        target,
        startIndexOfCoords
      );

      expect(res).toEqual(expected);
    });

    test('#3: 100,100 index=1', () => {
      const target: Coordinate = [100, 100];
      const startIndexOfCoords = 1;

      const expected = 1;

      const res = getNearestCoordIndexForTest(
        coords,
        target,
        startIndexOfCoords
      );

      expect(res).toEqual(expected);
    });

    test('#4: 100,100 index=2', () => {
      const target: Coordinate = [100, 100];
      const startIndexOfCoords = 2;

      const expected = 11;

      const res = getNearestCoordIndexForTest(
        coords,
        target,
        startIndexOfCoords
      );

      expect(res).toEqual(expected);
    });

    test('#5: 100,100 index=11', () => {
      const target: Coordinate = [100, 100];
      const startIndexOfCoords = 11;

      const expected = 11;

      const res = getNearestCoordIndexForTest(
        coords,
        target,
        startIndexOfCoords
      );

      expect(res).toEqual(expected);
    });

    test('#6: 100,100 index=12', () => {
      const target: Coordinate = [100, 100];
      const startIndexOfCoords = 12;

      const expected = 19;

      const res = getNearestCoordIndexForTest(
        coords,
        target,
        startIndexOfCoords
      );

      expect(res).toEqual(expected);
    });
  });

  describe('getBetweenCoords', () => {
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

    test('#1', () => {
      /**
       * #1
       */
      const start: Coordinate = [10, 10];
      const end: Coordinate = [100, 100];
      const startIndexOfCoords = 0;

      const res = getCoordsBetweenForTest(
        coords,
        start,
        end,
        startIndexOfCoords
      );
      const [resCoords, resEndIndex] = res;

      const expected: [Coordinate[], number] = [
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
      const expectedCoords = expected[0];
      const expectedEndIndex = expected[1];

      console.debug('expected', expected);
      console.debug('res', res);

      // 検証

      // end index
      expect(resEndIndex).toEqual(expectedEndIndex);

      // coords number
      expect(resCoords.length).toEqual(expectedCoords.length);

      for (let i = 0; i < resCoords.length; i++) {
        const resCoord = resCoords[i];
        const [x, y] = resCoord;
        const expCoord = expectedCoords[i];
        const [expcX, expcY] = expCoord;
        expect(x).toEqual(expcX);
        expect(y).toEqual(expcY);
      }
    });

    test('#2', () => {
      /**
       * #2
       */

      const start: Coordinate = [100, 100];
      const end: Coordinate = [100, 100];
      const startIndexOfCoords = 2;

      const res = getCoordsBetweenForTest(
        coords,
        start,
        end,
        startIndexOfCoords
      );
      const [resCoords, resEndIndex] = res;

      const expected: [Coordinate[], number] = [
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
      const expectedCoords = expected[0];
      const expectedEndIndex = expected[1];

      console.debug('expected', expected);
      console.debug('res', res);

      // 検証

      // end index
      expect(resEndIndex).toEqual(expectedEndIndex);

      // coords number
      expect(resCoords.length).toEqual(expectedCoords.length);

      for (let i = 0; i < resCoords.length; i++) {
        const resCoord = resCoords[i];
        const [x, y] = resCoord;
        const expCoord = expectedCoords[i];
        const [expcX, expcY] = expCoord;
        expect(x).toEqual(expcX);
        expect(y).toEqual(expcY);
      }
    });
  });
});
