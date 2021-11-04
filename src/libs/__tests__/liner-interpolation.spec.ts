import { linerInterpolationByPressure } from '../liner-interpolation';
import { Point } from '../../interface';

describe('liner-interpolation', () => {
  test('linerInterpolationWithPressure', () => {
    const start: Point = {
      x: 0,
      y: 0,
      force: 0,
    };
    const end: Point = {
      x: 10,
      y: 100,
      force: 1,
    };
    const points = linerInterpolationByPressure(start, end);

    const expectedPoints: Point[] = [
      {
        x: 0,
        y: 0,
        force: 0,
      },
      {
        x: 1,
        y: 10,
        force: 0.1,
      },
      {
        x: 2,
        y: 20,
        force: 0.2,
      },
      {
        x: 3,
        y: 30,
        force: 0.3,
      },
      {
        x: 4,
        y: 40,
        force: 0.4,
      },
      {
        x: 5,
        y: 50,
        force: 0.5,
      },
      {
        x: 6,
        y: 60,
        force: 0.6,
      },
      {
        x: 7,
        y: 70,
        force: 0.7,
      },
      {
        x: 8,
        y: 80,
        force: 0.8,
      },
      {
        x: 9,
        y: 90,
        force: 0.9,
      },
      {
        x: 10,
        y: 100,
        force: 1,
      },
    ];

    expect(points).toEqual(expect.arrayContaining(expectedPoints));
  });
});
