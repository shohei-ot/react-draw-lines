import { Line, Point } from '../..';
import { pointsToLines } from '../points-to-lines';

describe('points to lines', () => {
  test('points-to-lines', () => {
    const points: Point[] = [
      {
        x: 0,
        y: 0,
        force: 0,
        identifier: 0,
      },
      {
        x: 1,
        y: 10,
        force: 0.1,
        identifier: 0,
      },
      {
        x: 2,
        y: 20,
        force: 0.2,
        identifier: 0,
      },
      {
        x: 3,
        y: 30,
        force: 0.3,
        identifier: 0,
      },
      {
        x: 4,
        y: 40,
        force: 0.4,
        identifier: 0,
      },
      {
        x: 5,
        y: 50,
        force: 0.5,
        identifier: 0,
      },
    ];
    const expectedLines: Line[] = [
      {
        start: {
          x: 0,
          y: 0,
          force: 0,
          identifier: 0,
        },
        end: {
          x: 1,
          y: 10,
          force: 0.1,
          identifier: 0,
        },
      },
      {
        start: {
          x: 1,
          y: 10,
          force: 0.1,
          identifier: 0,
        },
        end: {
          x: 2,
          y: 20,
          force: 0.2,
          identifier: 0,
        },
      },
      {
        start: {
          x: 2,
          y: 20,
          force: 0.2,
          identifier: 0,
        },
        end: {
          x: 3,
          y: 30,
          force: 0.3,
          identifier: 0,
        },
      },
      {
        start: {
          x: 3,
          y: 30,
          force: 0.3,
          identifier: 0,
        },
        end: {
          x: 4,
          y: 40,
          force: 0.4,
          identifier: 0,
        },
      },
      {
        start: {
          x: 4,
          y: 40,
          force: 0.4,
          identifier: 0,
        },
        end: {
          x: 5,
          y: 50,
          force: 0.5,
          identifier: 0,
        },
      },
    ];
    const lines: Line[] = pointsToLines(points);
    expect(lines).toEqual(expect.arrayContaining(expectedLines));
  });
});
