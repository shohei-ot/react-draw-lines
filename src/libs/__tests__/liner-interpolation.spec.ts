import {
  linerInterpolation,
  linerInterpolationByPressure,
} from '../liner-interpolation';
import { Point } from '../../interface';

describe('liner-interpolation', () => {
  test('linerInterpolationWithPressure', () => {
    const start: Point = {
      x: 0,
      y: 0,
      force: 0,
      identifier: 0,
    };
    const end: Point = {
      x: 10,
      y: 100,
      force: 1,
      identifier: 0,
    };
    const points = linerInterpolationByPressure(start, end);

    const expectedPoints: Point[] = [
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
      {
        x: 6,
        y: 60,
        force: 0.6,
        identifier: 0,
      },
      {
        x: 7,
        y: 70,
        force: 0.7,
        identifier: 0,
      },
      {
        x: 8,
        y: 80,
        force: 0.8,
        identifier: 0,
      },
      {
        x: 9,
        y: 90,
        force: 0.9,
        identifier: 0,
      },
      {
        x: 10,
        y: 100,
        force: 1,
        identifier: 0,
      },
    ];

    expect(points).toEqual(expect.arrayContaining(expectedPoints));
  });

  test('linerInterpolation', () => {
    const start: Point = {
      x: 142.2578125,
      y: 110.63671875,
      force: 1,
      identifier: 0,
    };
    const end: Point = {
      x: 142.2578125,
      y: 110.63671875,
      force: 0,
      identifier: 0,
    };
    const nextY = linerInterpolation(start, end, start.x);
    expect(nextY).toEqual(end.y);
  });

  test('fix NaN y', () => {
    const start: Point = {
      x: 142.2578125,
      y: 110.63671875,
      force: 1,
      identifier: 0,
    };
    const end: Point = {
      x: 142.2578125,
      y: 110.63671875,
      force: 0,
      identifier: 0,
    };
    const points = linerInterpolationByPressure(start, end);

    const expectedPoints: Point[] = [
      {
        x: 142.2578125,
        y: 110.63671875,
        force: 1,
        identifier: 0,
      },
      {
        x: 142.2578125,
        y: 110.63671875,
        force: 0.9,
        identifier: 0,
      },
      {
        x: 142.2578125,
        y: 110.63671875,
        force: 0.8,
        identifier: 0,
      },
      {
        x: 142.2578125,
        y: 110.63671875,
        force: 0.7,
        identifier: 0,
      },
      {
        x: 142.2578125,
        y: 110.63671875,
        force: 0.6,
        identifier: 0,
      },
      {
        x: 142.2578125,
        y: 110.63671875,
        force: 0.5,
        identifier: 0,
      },
      {
        x: 142.2578125,
        y: 110.63671875,
        force: 0.4,
        identifier: 0,
      },
      {
        x: 142.2578125,
        y: 110.63671875,
        force: 0.3,
        identifier: 0,
      },
      {
        x: 142.2578125,
        y: 110.63671875,
        force: 0.2,
        identifier: 0,
      },
      {
        x: 142.2578125,
        y: 110.63671875,
        force: 0.1,
        identifier: 0,
      },
      {
        x: 142.2578125,
        y: 110.63671875,
        force: 0,
        identifier: 0,
      },
    ];

    expect(points).toEqual(expect.arrayContaining(expectedPoints));
  });
});
