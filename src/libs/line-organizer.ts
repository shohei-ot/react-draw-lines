import {
  CanvasStyle,
  DEFAULT_CANVAS_STYLE,
  Line,
  Point,
  Stroke,
} from '../interface';
import { linerInterpolationByPressure } from './liner-interpolation';
import { pointsToLines } from './points-to-lines';

export class LineOrganizer {
  public static customStyle?: Partial<CanvasStyle>;

  private static get style(): CanvasStyle {
    return Object.assign(
      {},
      DEFAULT_CANVAS_STYLE,
      LineOrganizer.customStyle ?? {}
    );
  }

  public static genLine(prevPos: Point, nextPos: Point): Line {
    return { start: prevPos, end: nextPos };
  }

  public static drawLineStrokes(
    ctx: CanvasRenderingContext2D,
    strokes: Stroke[]
  ): void {
    if (strokes.length < 1) return;

    const interpolatedLineStrokes = strokes.map((stroke) => {
      return {
        ...stroke,
        lines: [
          ...stroke.lines
            .map((line) => [...this.interpolateLine(line)])
            .reduce((acm, lines) => [...acm, ...lines], []),
        ],
      };
    });

    ctx.beginPath();
    ctx.lineWidth = this.style.lineWidth;
    ctx.lineJoin = this.style.lineJoin;
    ctx.lineCap = this.style.lineCap;
    ctx.strokeStyle = this.style.strokeStyle;

    // ストローク毎に処理
    interpolatedLineStrokes.forEach((stroke) => {
      ctx.moveTo(stroke.startX, stroke.startY);
      stroke.lines.forEach((line) => {
        ctx.lineWidth = this.style.lineWidth * (line.start.force ?? 1);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.stroke();
      });
    });
  }

  // private static nonPressureLines(lines: Line[]): boolean {
  //   return lines.every(
  //     (line) => (line.start.force ?? 0) === 0 || (line.end.force ?? 0) === 0
  //   );
  // }

  public static interpolateLine(line: Line): Line[] {
    const noNeedInterpolation =
      typeof line.start.force === 'undefined' ||
      typeof line.end.force === 'undefined' ||
      line.start.force === 0 ||
      line.end.force === 0;

    if (noNeedInterpolation) {
      return [line];
    }

    const points: Point[] = linerInterpolationByPressure(line.start, line.end);
    const lines: Line[] = pointsToLines(points);

    return lines;
  }
}
