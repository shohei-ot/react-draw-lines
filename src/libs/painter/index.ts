import EE from 'eventemitter3';
import { CanvasStyle, DEFAULT_CANVAS_STYLE, Line } from './interface';
import { Stroke } from './stroke';

type PainterEvents = {
  [x: string]: string;
  DRAW: string;
  CLEAR: string;
};

export class Painter extends EE {
  public static readonly EVENTS: PainterEvents = {
    DRAW: 'DRAW',
    CLEAR: 'CLEAR',
  };

  private ctx: CanvasRenderingContext2D;

  private strokes: Stroke[] = [];

  public style: CanvasStyle = { ...DEFAULT_CANVAS_STYLE };

  constructor(ctx: CanvasRenderingContext2D) {
    super();
    this.ctx = ctx;
    this.ctx.beginPath();
  }

  public newStroke(): Stroke {
    // console.log('# call painter.newStroke');

    // const stroke = new Stroke(this);
    const stroke = new Stroke();
    stroke.on(Stroke.EVENTS.ADD_LINE, (line: Line) => {
      window.requestAnimationFrame(() => {
        this.drawLine(line);
      });
    });
    stroke.on(Stroke.EVENTS.ORGANIZED_LINES, () => {
      window.requestAnimationFrame(() => {
        this.ctx.stroke();
      });
    });
    this.strokes.push(stroke);
    return stroke;
  }

  public clear() {
    Object.keys(Stroke.EVENTS).forEach((key) => {
      this.strokes.forEach((stroke) => {
        stroke.removeAllListeners(key);
      });
    });
    this.strokes = [];

    this.emit(Painter.EVENTS.CLEAR);
  }

  public draw() {
    // console.log('# call painter.draw');

    this.strokes.forEach((stroke) => {
      try {
        const strokeDatum = stroke.getStroke();
        // this.ctx.moveTo(strokeDatum.start.x, strokeDatum.start.y);

        strokeDatum.lines.forEach((line) => {
          this.drawLine(line);
          // this.ctx.lineWidth = this.style.lineWidth * (line.start.force ?? 1);
          // this.ctx.lineTo(line.end.x, line.end.y);
          // this.ctx.stroke();
        });
      } catch (e) {
        console.error({ stroke });
        throw e;
      }
    });

    this.emit(Painter.EVENTS.DRAW);
  }

  public drawLine(line: Line) {
    this.ctx.lineJoin = this.style.lineJoin;
    this.ctx.lineCap = this.style.lineCap;
    this.ctx.strokeStyle = this.style.strokeStyle;
    this.ctx.lineWidth = this.style.lineWidth * (line.start.force ?? 1);

    this.ctx.moveTo(line.start.x, line.start.y);
    this.ctx.lineTo(line.end.x, line.end.y);
    // this.ctx.stroke();
  }
}
