import React, { useEffect, useRef, useState } from 'react';
import { CanvasStyle, Stroke } from './interface';
import { LineOrganizer } from './libs/line-organizer';

export type PresenterProps = {
  canvasId?: string;
  className?: string;
  style?: React.CSSProperties;
  lineStrokes: Stroke[];
  canvasStyle?: Partial<CanvasStyle>;
  onTouchStart: (e: HTMLElementEventMap['touchstart']) => void;
  onTouchMove: (e: HTMLElementEventMap['touchmove']) => void;
  onTouchEnd: (e: HTMLElementEventMap['touchend']) => void;
  onTouchCancel: (e: HTMLElementEventMap['touchcancel']) => void;
  onMouseDown: (e: HTMLElementEventMap['mousedown']) => void;
  onMouseMove: (e: HTMLElementEventMap['mousemove']) => void;
  onMouseUp: (e: HTMLElementEventMap['mouseup']) => void;
};

export const Presenter = (props: PresenterProps): JSX.Element => {
  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    lineStrokes,
    canvasStyle,
  } = props;

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [animateRequestId, setAnimateRequestId] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 親から渡ってくる lineStrokes を state に設定.
  useEffect(() => {
    setStrokes(lineStrokes);
  }, [lineStrokes]);

  useEffect(() => {
    setup();
    const unmount = () => {
      cleanup();
    };
    return unmount;
  }, []);

  const setup = () => {
    // Event Listener を登録
    const canvasEl = canvasRef.current;
    canvasEl?.addEventListener('touchstart', onTouchStart);
    canvasEl?.addEventListener('touchmove', onTouchMove);
    canvasEl?.addEventListener('touchend', onTouchEnd);
    canvasEl?.addEventListener('touchcancel', onTouchCancel);
    canvasEl?.addEventListener('mousedown', onMouseDown);
    canvasEl?.addEventListener('mousemove', onMouseMove);
    canvasEl?.addEventListener('mouseup', onMouseUp);

    startDrawLineStrokes();
  };

  const cleanup = () => {
    // Event listner を削除
    const canvasEl = canvasRef.current;
    canvasEl?.removeEventListener('touchstart', onTouchStart);
    canvasEl?.addEventListener('touchstart', onTouchStart);
    canvasEl?.addEventListener('touchmove', onTouchMove);
    canvasEl?.addEventListener('touchend', onTouchEnd);
    canvasEl?.addEventListener('touchcancel', onTouchCancel);
    canvasEl?.addEventListener('mousedown', onMouseDown);
    canvasEl?.addEventListener('mousemove', onMouseMove);
    canvasEl?.addEventListener('mouseup', onMouseUp);

    stopDrawLineStrokes();
  };

  const startDrawLineStrokes = () => {
    updateDisplayedLineStrokes();
  };

  const updateDisplayedLineStrokes = () => {
    const reqId = window.requestAnimationFrame(() => {
      drawLineStrokes();
      updateDisplayedLineStrokes();
    });
    setAnimateRequestId(reqId);
  };

  const stopDrawLineStrokes = () => {
    animateRequestId && window.cancelAnimationFrame(animateRequestId);
  };

  const drawLineStrokes = () => {
    const canvasEl = canvasRef.current;
    const ctx = canvasEl?.getContext('2d');
    if (!ctx) return;

    const customCanvasStyle: Partial<CanvasStyle> = Object.assign(
      canvasStyle ?? {}
    );
    LineOrganizer.customStyle = customCanvasStyle;
    LineOrganizer.drawLineStrokes(ctx, strokes);
  };

  return (
    <canvas ref={canvasRef} className={props.className} style={props.style} />
  );
};
