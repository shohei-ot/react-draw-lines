import EE from 'eventemitter3';
import { linerInterpolationByPressure } from './liner-interpolation';
import { Line, OneStroke, Point } from './interface';
import { pointsToLines } from './points-to-lines';

let strokeId = 0;

type StrokeEvents = {
  ADD_POINT: string;
  ORGANIZED_LINES: string;
  ADD_LINE: string;
};

export class Stroke extends EE {
  public static readonly EVENTS: StrokeEvents = {
    ADD_POINT: 'ADD_POINT',
    ORGANIZED_LINES: 'ORGANIZED_LINES',
    ADD_LINE: 'ADD_LINE',
  };

  // private readonly painter: Painter;
  public readonly id: number;

  private points: Point[] = [];

  private lines: Line[] = [];

  // constructor(painter: Painter) {
  constructor() {
    super();
    this.id = strokeId++;
    this.on(Stroke.EVENTS.ADD_POINT, this.organizeLines);
  }

  public getLines(): Line[] {
    return this.lines;
  }

  public getStroke(): OneStroke {
    const strokeDatum = {
      _id: this.id,
      start: this.points[0],
      end: this.points[this.points.length - 1],
      lines: this.lines,
    };
    return strokeDatum;
  }

  public addPoint(point: Point | Point[]) {
    // console.log('### call stroke.addPoint', point);

    const points = Array.isArray(point) ? point : [point];
    this.points.push(...points);
    this.emit(Stroke.EVENTS.ADD_POINT);
  }

  private genLatestLine(): Line {
    if (this.points.length === 0) {
      throw new Error('points が 1 つもありません。');
    }

    if (this.points.length === 1) {
      return {
        start: this.points[this.points.length - 1],
        end: this.points[this.points.length - 1],
      };
    }

    return {
      start: this.points[this.points.length - 2],
      end: this.points[this.points.length - 1],
    };
  }

  private organizeLines() {
    const newLine = this.genLatestLine();
    const lines: Line[] = (() => {
      if (this.lines.length > 1) {
        return pointsToLines(
          linerInterpolationByPressure(newLine.start, newLine.end)
        );
      }
      return [newLine];
    })();

    // if (this.lines.length > 1) {
    //   const interpolatedLines =
    //   this.lines.push(...pointsToLines(interpolatedLines));
    // } else {
    //   this.lines.push(newLine);
    // }
    lines.forEach((line) => {
      this.addLine(line);
    });

    this.emit(Stroke.EVENTS.ORGANIZED_LINES);
  }

  private addLine(line: Line) {
    this.lines.push(line);
    this.emit(Stroke.EVENTS.ADD_LINE, line);
  }
}
