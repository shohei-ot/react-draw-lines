import React, { useRef, useState } from 'react';
import { Point } from './interface';
import { getPoint } from './libs/get-point';
import { CanvasStyle, DEFAULT_CANVAS_STYLE } from './interface';
import { linerInterpolationByPressure } from './libs/liner-interpolation';

type DrawEvent =
  | React.MouseEvent<HTMLCanvasElement, MouseEvent>
  | React.TouchEvent<HTMLCanvasElement>;

export type Props = {
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor?: string;
  onChange?: (out: { lines: Point[][]; imgUrl: string }) => void;
};

type CanvasLayerName = 'DRAWING_HISTORY' | 'TMP' | 'USER_INTERFACE';

type MappedConst<T extends string> = { [key in T]: key };

const CANVAS_LAYER: MappedConst<CanvasLayerName> = {
  DRAWING_HISTORY: 'DRAWING_HISTORY',
  TMP: 'TMP',
  USER_INTERFACE: 'USER_INTERFACE',
};

const layerNames: Array<keyof typeof CANVAS_LAYER> =
  Object.values(CANVAS_LAYER);

type CanvasLayerRefs = {
  [key in keyof typeof CANVAS_LAYER]: React.MutableRefObject<HTMLCanvasElement | null>;
};

const CANVAS_COMMON_STYLE: React.CSSProperties = {
  display: 'block',
  position: 'absolute',
};

const CANVAS_CONTEXT_STYLE: CanvasStyle = {
  ...DEFAULT_CANVAS_STYLE,
};

export const DrawLine = (props: Props): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const canvasRefs: CanvasLayerRefs = {
    DRAWING_HISTORY: useRef<HTMLCanvasElement | null>(null),
    TMP: useRef<HTMLCanvasElement | null>(null),
    USER_INTERFACE: useRef<HTMLCanvasElement | null>(null),
  };

  const [ctxTranslated, setCtxTranslated] = useState(false);

  // ポインターが移動した事を示すフラグ
  let pointerHasMoved = false;

  // 線を引いているフラグ
  const [drawingStarted, setDrawingStarted] = useState(false);

  // 引かれた線
  const [lines, setLines] = useState<Point[][]>([]);

  // 引いている線を表現する整形済みポイントの配列
  const [points, setPoints] = useState<Point[]>([]);

  // TODO: 全消し機能
  // TODO: リサイズ機能
  // TODO: 復元機能? (描画済み画像を受け取って背景画像として読み込み)

  const handleDrawStart = (e: DrawEvent) => {
    if (drawingStarted) {
      return;
    }

    setDrawingStarted(true);

    addPoint(getPoint(e.nativeEvent));
    drawPoints();

    pointerHasMoved = true;
  };

  const handleDrawMove = (e: DrawEvent) => {
    if (!drawingStarted) {
      return;
    }

    addPoint(getPoint(e.nativeEvent, points[points.length - 1]));
    drawPoints();

    pointerHasMoved = true;
  };

  const handleDrawEnd = (e: DrawEvent) => {
    if (!drawingStarted) {
      return;
    }

    addPoint(getPoint(e.nativeEvent, points[points.length - 1]));
    drawPoints();
    savePointsToLine();
    transcribeTmpToDrawingHistory();
    clearCanvas(['TMP']);

    setDrawingStarted(false);
    pointerHasMoved = true;

    handleOnChange();
  };

  const handleOnChange = () => {
    if (!props.onChange) return;

    const canvas = canvasRefs.DRAWING_HISTORY.current;
    if (!canvas) return;

    const imgUrl = canvas.toDataURL('image/png');
    props.onChange({ lines: JSON.parse(JSON.stringify(lines)), imgUrl });
  };

  const addPoint = (point: Point) => {
    if (points.length === 0) {
      points.push(point);
      setPoints([...points]);
    } else {
      const organizedPoints = linerInterpolationByPressure(
        points[points.length - 1],
        point
      );
      points.push(...organizedPoints);
      setPoints([...points]);
    }
  };

  const drawPoints = () => {
    if (points.length === 0) return;
    if (!canvasRefs.TMP.current) return;
    const tmpCtx = canvasRefs.TMP.current.getContext('2d');
    if (!tmpCtx) return;

    const isFirstPoint = points.length === 1;

    const prevPoint = isFirstPoint ? points[0] : points[points.length - 2];
    const latestPoint = points[points.length - 1];

    if (!ctxTranslated) {
      tmpCtx.translate(0.5, 0.5);
      setCtxTranslated(true);
    }

    if (isFirstPoint) {
      tmpCtx.beginPath();
    }

    // canvas styles
    // FIXME: 筆圧の取り扱い
    tmpCtx.lineWidth = CANVAS_CONTEXT_STYLE.lineWidth * latestPoint.force;
    tmpCtx.lineCap = CANVAS_CONTEXT_STYLE.lineCap;
    tmpCtx.lineJoin = CANVAS_CONTEXT_STYLE.lineJoin;
    tmpCtx.strokeStyle = CANVAS_CONTEXT_STYLE.strokeStyle;

    tmpCtx.moveTo(prevPoint.x, prevPoint.y);
    tmpCtx.lineTo(latestPoint.x, latestPoint.y);

    tmpCtx.stroke();
  };

  const savePointsToLine = () => {
    lines.push([...points]);
    setLines([...lines]);
    setPoints([]);
  };

  const transcribeTmpToDrawingHistory = () => {
    if (!canvasRefs.DRAWING_HISTORY.current || !canvasRefs.TMP.current) return;

    const tmpCtx = canvasRefs.TMP.current.getContext('2d');
    const historyCtx = canvasRefs.DRAWING_HISTORY.current.getContext('2d');
    if (!historyCtx || !tmpCtx) return;

    historyCtx.drawImage(
      tmpCtx.canvas,
      0,
      0,
      props.canvasWidth,
      props.canvasHeight
    );
  };

  const clearCanvas = (keys: CanvasLayerName[]) => {
    keys.forEach((k) => {
      if (!canvasRefs[k].current) return;
      const ctx = canvasRefs[k].current?.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, props.canvasWidth, props.canvasHeight);
    });
  };

  // const loop = (once = false) => {
  //   pointerHasMoved = false;
  //   if (!once) {
  //     window.requestAnimationFrame(() => {
  //       loop();
  //     });
  //   }
  // };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'block',
        width: `${props.canvasWidth}px`,
        height: `${props.canvasHeight}px`,
        touchAction: 'none',
        backgroundColor: props.backgroundColor,
      }}
    >
      {layerNames.map((layerName) => {
        const isInterface = layerName === CANVAS_LAYER.USER_INTERFACE;
        const casnvasRef = canvasRefs[layerName];
        return (
          <canvas
            ref={casnvasRef}
            key={layerName}
            style={{ ...CANVAS_COMMON_STYLE }}
            width={props.canvasWidth}
            height={props.canvasHeight}
            onMouseDown={isInterface ? handleDrawStart : undefined}
            onMouseMove={isInterface ? handleDrawMove : undefined}
            onMouseUp={isInterface ? handleDrawEnd : undefined}
            onMouseLeave={isInterface ? handleDrawEnd : undefined}
            onTouchStart={isInterface ? handleDrawStart : undefined}
            onTouchMove={isInterface ? handleDrawMove : undefined}
            onTouchEnd={isInterface ? handleDrawEnd : undefined}
            onTouchCancel={isInterface ? handleDrawEnd : undefined}
          />
        );
      })}
    </div>
  );
};

export default DrawLine;
