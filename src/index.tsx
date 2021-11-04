import React, { useState } from 'react';
import { Line, Point, Stroke } from './interface';
import { Presenter } from './presenter';

let INSTANCE_ID_SEQUENCE_POINT = 0;

export const ReactDrawLines = (): JSX.Element => {
  const [instanceId] = useState(INSTANCE_ID_SEQUENCE_POINT++);
  const [drawingFlag, setDrawingFlag] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  // const [currentLines, setCurrentLines] = useState<Partial<Line> | null>(null);

  // TODO: 各 TouchEvent 毎に処理を作る
  // 1. touchstart, mousedown: touchstart flag を true + currentStroke, currentLine 開始
  // 2. touchmove, mousemove: touchstart flag が true なら座標取得, currentLines に追加しつつ currentStroke を更新していく。
  // 3. touchend, mouseup: touchstart flag が true なら座標取得, currentLine を完了して currentStroke を更新 + touchstart flag を false
  // 4. touchcancel: touchstart flag が true なら touchstart flag を false + 現在の Stroke を削除

  const onTouchStart = (e: HTMLElementEventMap['touchstart']) => {
    setDrawingFlag(true);
    const point = getPoint(e.touches[0]);
    startStroke(point);
  };

  const onTouchMove = (e: HTMLElementEventMap['touchmove']) => {
    if (!drawingFlag) return;
    if (!currentStroke) throw new Error('currentStroke が初期化されていません');

    const currentPoint = getPoint(e.touches[0]);
    const startPoint = getPrevPoint(currentStroke);

    addStrokeLines([{ start: startPoint, end: currentPoint }]);
  };

  const onTouchEnd = (e: HTMLElementEventMap['touchend']) => {
    if (!drawingFlag) return;
    if (!currentStroke) throw new Error('currentStroke が初期化されていません');

    const currentPoint = getPoint(e.touches[0]);

    endStroke(currentPoint);
    setDrawingFlag(false);
  };

  const onTouchCancel = (e: HTMLElementEventMap['touchcancel']) => {
    if (!drawingFlag) return;
    if (!currentStroke) throw new Error('currentStroke が初期化されていません');

    clearTmpDrawing();
    setDrawingFlag(false);
  };

  const onMouseDown = (e: HTMLElementEventMap['mousedown']) => {
    setDrawingFlag(true);
    const point = getPoint(e);
    startStroke(point);
  };

  const onMouseMove = (e: HTMLElementEventMap['mousemove']) => {
    if (!drawingFlag) return;
    if (!currentStroke) throw new Error('currentStroke が初期化されていません');

    const currentPoint = getPoint(e);
    const startPoint = getPrevPoint(currentStroke);

    addStrokeLines([{ start: startPoint, end: currentPoint }]);
  };

  const onMouseUp = (e: HTMLElementEventMap['mouseup']) => {
    if (!drawingFlag) return;
    if (!currentStroke) throw new Error('currentStroke が初期化されていません');

    const currentPoint = getPoint(e);

    endStroke(currentPoint);
    setDrawingFlag(false);
  };

  const getPrevPoint = (stroke: Stroke) => {
    const initialLine = stroke ? stroke.lines.length === 0 : false;
    if (initialLine) {
      return {
        x: stroke.startX,
        y: stroke.startY,
        force: stroke.startForce,
      };
    }
    return stroke.lines[stroke.lines.length - 1].end;
  };

  const startStroke = (start: Point): Stroke => {
    if (currentStroke) {
      throw new Error(
        'currentStroke が有るのに startStroke() が呼び出されました。'
      );
    }
    const stroke = {
      startX: start.x,
      startY: start.y,
      startForce: start.force,
      lines: [],
      endX: 0,
      endY: 0,
      endForce: undefined,
    };
    setCurrentStroke(stroke);
    return stroke;
  };

  const getPoint = (ev: MouseEvent | Touch): Point => {
    const target = ev.target as HTMLCanvasElement | null;
    if (!target) throw new Error('ev.target が不在');

    const rect = target.getBoundingClientRect();

    const x = ev.pageX - rect.left;
    const y = ev.pageY - rect.top;
    const force = 'force' in ev ? ev.force : 1;

    return {
      x,
      y,
      force,
    };
  };

  const addStrokeLines = (lines: Line[]): Stroke => {
    if (!currentStroke) {
      throw new Error(
        'currentStroke が無いのに endStroke() が呼び出されました。'
      );
    }
    currentStroke.lines.push(...lines);
    setCurrentStroke(currentStroke);
    return currentStroke;
  };

  const endStroke = (point: Point) => {
    if (!currentStroke) {
      throw new Error(
        'currentStroke が無いのに endStroke() が呼び出されました。'
      );
    }
    currentStroke.endX = point.x;
    currentStroke.endY = point.y;
    currentStroke.endForce = point.force;
    strokes.push(currentStroke);
    setStrokes(strokes);
    clearTmpDrawing();
  };

  const clearTmpDrawing = () => {
    // setCurrentLines(null);
    setCurrentStroke(null);
  };

  return (
    <Presenter
      canvasId={`react-draw-lines-${instanceId}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      lineStrokes={strokes}
    />
  );
};
