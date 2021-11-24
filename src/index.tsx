import React, { FC, useEffect, useRef } from 'react';
import { Painter } from './libs/painter';
import { Stroke } from './libs/painter/stroke';
import { CanvasStyle, Point } from './libs/painter/interface';

// const INSTANCE_ID_SEQUENCE_POINT = 0;

export type Props = {
  width: number;
  height: number;
  onDraw?: (imgBase64: string) => void;
  className?: string;
  canvasStyle?: Partial<CanvasStyle>;
  style?: React.CSSProperties;
};

export const ReactDrawLines: FC<Props> = (props: Props): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const preRenderCanvasRef = useRef<HTMLCanvasElement>(null);

  const drawLineStrokes = () => {
    if (!painter) return;
    painter?.draw();
  };

  let painter: Painter | null = null;
  const setPainter = (p: Painter | null) => {
    painter = p;
  };

  let drawingFlag = false;
  const setDrawingFlag = (status: boolean) => {
    drawingFlag = status;
  };

  let currentStroke: Stroke | null = null;
  const setCurrentStroke = (stroke: Stroke | null) => {
    currentStroke = stroke;
  };

  let animateRequestId: number | null = null;
  const setAnimateRequestId = (id: number | null) => {
    animateRequestId = id;
  };

  const setup = (el: HTMLCanvasElement) => {
    const ctx = el.getContext('2d');
    if (!ctx) throw new Error('failed to got context 2d from canvas element');

    const p = new Painter(ctx);
    // console.log({ painter: p });
    p.on(Painter.EVENTS.DRAW, onDrawHandler);
    setPainter(p);

    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('touchmove', onTouchMove);
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchCancel);
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseup', onMouseUp);
    startDrawLineStrokes();
  };

  const cleanup = (el: HTMLCanvasElement) => {
    // console.log('### call cleanup');
    if (painter) {
      endCurrentStroke();
      painter.clear();
      setPainter(null);
    }

    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchmove', onTouchMove);
    el.removeEventListener('touchend', onTouchEnd);
    el.removeEventListener('touchcancel', onTouchCancel);
    el.removeEventListener('mousedown', onMouseDown);
    el.removeEventListener('mousemove', onMouseMove);
    el.removeEventListener('mouseup', onMouseUp);
    stopDrawLineStrokes();
  };

  const startDrawLineStrokes = () => {
    updateDisplayedLineStrokes();
  };

  const updateDisplayedLineStrokes = () => {
    // console.log('# call updateDisplayedLineStrokes');
    const reqId = window.requestAnimationFrame(() => {
      drawLineStrokes();
      updateDisplayedLineStrokes();
    });
    setAnimateRequestId(reqId);
  };

  const stopDrawLineStrokes = () => {
    animateRequestId !== null && window.cancelAnimationFrame(animateRequestId);
  };

  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;

    const canvasEl = canvasRef.current;
    setup(canvasEl);

    return ((c) => {
      () => {
        cleanup(c);
      };
    })(canvasEl);
  }, [canvasRef]);

  // 1. touchstart, mousedown: touchstart flag を true + currentStroke, currentLine 開始
  // 2. touchmove, mousemove: touchstart flag が true なら座標取得, currentLines に追加しつつ currentStroke を更新していく。
  // 3. touchend, mouseup: touchstart flag が true なら座標取得, currentLine を完了して currentStroke を更新 + touchstart flag を false
  // 4. touchcancel: touchstart flag が true なら touchstart flag を false + 現在の Stroke を削除

  const startNewStroke = () => {
    setDrawingFlag(true);

    const stroke = (() => {
      if (!painter) throw new Error('un-initialized painter');
      if (currentStroke) {
        throw new Error(
          'currentStroke が有るのに startStroke() が呼び出されました。'
        );
      }
      return painter.newStroke();
    })();

    setCurrentStroke(stroke);
    return stroke;
  };

  const endCurrentStroke = () => {
    setCurrentStroke(null);
    setDrawingFlag(false);
  };

  const onTouchStart = (e: TouchEvent) => {
    const stroke = startNewStroke();
    const point = getPoint(e.touches[0]);
    stroke.addPoint(point);
  };

  const onTouchMove = (e: HTMLElementEventMap['touchmove']) => {
    if (!drawingFlag) return;
    if (!currentStroke) throw new Error('currentStroke が初期化されていません');

    const currentPoint = getPoint(e.touches[0]);
    currentStroke.addPoint(currentPoint);
  };

  const onTouchEnd = (e: HTMLElementEventMap['touchend']) => {
    if (!drawingFlag) return;
    if (!currentStroke) throw new Error('currentStroke が初期化されていません');

    const currentPoint = getPoint(e.touches[0]);

    currentStroke.addPoint(currentPoint);
    endCurrentStroke();
  };

  const onDrawHandler = () => {
    // console.log('# call onDrawHandler', { drawingFlag });

    const canvasEl = canvasRef.current;
    if (!canvasEl) {
      throw new Error(
        'Failed to get canvasRef.current, expecting HTMLCanvasElement.'
      );
    }
    const image = canvasEl.toDataURL();
    props.onDraw && props.onDraw(image);
  };

  const onTouchCancel = () => {
    if (!drawingFlag) return;
    if (!currentStroke) return;

    endCurrentStroke();
  };

  const onMouseDown = (e: HTMLElementEventMap['mousedown']) => {
    // console.log('# cal onMouseDown');

    const stroke = startNewStroke();
    const point = getPoint(e);
    stroke.addPoint(point);
  };

  const onMouseMove = (e: HTMLElementEventMap['mousemove']) => {
    if (!drawingFlag) return;
    if (!currentStroke) throw new Error('currentStroke が初期化されていません');

    // console.log('# cal onMouseMove');

    const currentPoint = getPoint(e);
    // console.log({ currentPoint });
    // console.log({ currentStroke });
    currentStroke.on(Stroke.EVENTS.ADD_POINT, (args) => {
      // console.log('@@@ call addPoint @@@');
      // console.log({ currentStroke, args });
      // console.logEnd();
    });
    currentStroke.addPoint(currentPoint);
  };

  const onMouseUp = (e: HTMLElementEventMap['mouseup']) => {
    if (!drawingFlag) return;
    if (!currentStroke) throw new Error('currentStroke が初期化されていません');

    // console.log('# call onMouseUp');

    const currentPoint = getPoint(e);
    currentStroke.addPoint(currentPoint);
    endCurrentStroke();
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

  return (
    <canvas
      ref={canvasRef}
      width={props.width}
      height={props.height}
      className={props.className}
      style={props.style}
    />
  );
};
