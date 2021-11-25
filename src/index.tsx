// import { LazyBrush } from 'lazy-brush';
import React, { useRef } from 'react';
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
  onChange?: (imgUrl: string) => void;
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

// const LAZY = {
//   RADIUS: 10,
// };

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

  // const lazy = new LazyBrush({ radius: LAZY.RADIUS });

  // ポインターが移動した事を示すフラグ
  let pointerHasMoved = false;

  // 線を引いているフラグ
  let drawingStarted = false;

  // 引かれた線
  const lines: Point[][] = [];

  // 引いている線を表現する整形済みポイントの配列
  const points: Point[] = [];

  const handleDrawStart = (e: DrawEvent) => {
    if (drawingStarted) return;
    drawingStarted = true;

    addPoint(getPoint(e.nativeEvent));
    drawPoints();

    pointerHasMoved = true;
  };

  const handleDrawMove = (e: DrawEvent) => {
    if (!drawingStarted) return;

    addPoint(getPoint(e.nativeEvent));
    drawPoints();

    pointerHasMoved = true;
  };

  const handleDrawEnd = (e: DrawEvent) => {
    if (!drawingStarted) return;

    addPoint(getPoint(e.nativeEvent));
    drawPoints();
    savePointsToLine();
    transcribeTmpToDrawingHistory();
    clearCanvas(['TMP']);

    drawingStarted = false;
    pointerHasMoved = true;

    handleOnChange();
  };

  const handleOnChange = () => {
    if (!props.onChange) return;

    const canvas = canvasRefs.DRAWING_HISTORY.current;
    if (!canvas) return;

    const imgUrl = canvas.toDataURL('image/png');
    props.onChange(imgUrl);
  };

  const addPoint = (point: Point) => {
    // rawPoints.push(point)
    if (points.length === 0) {
      points.push(point);
    } else {
      const organizedPoints = linerInterpolationByPressure(
        points[points.length - 1],
        point
      );
      points.push(...organizedPoints);
    }

    return points;
  };

  // let drawPointsAnimateId: number | null = null;

  const drawPoints = () => {
    if (points.length === 0) return;
    if (!canvasRefs.TMP.current) return;
    const tmpCtx = canvasRefs.TMP.current.getContext('2d');
    if (!tmpCtx) return;

    // if (drawPointsAnimateId !== null) {
    //   window.cancelAnimationFrame(drawPointsAnimateId);
    // }

    // canvas styles
    tmpCtx.lineWidth = CANVAS_CONTEXT_STYLE.lineWidth;
    tmpCtx.lineCap = CANVAS_CONTEXT_STYLE.lineCap;
    tmpCtx.lineJoin = CANVAS_CONTEXT_STYLE.lineJoin;
    tmpCtx.strokeStyle = CANVAS_CONTEXT_STYLE.strokeStyle;

    // 描画処理
    // ctx.moveTo(points[0].x, points[0].y);
    // ctx.beginPath();
    // points.forEach((p) => {
    //   ctx.lineTo(p.x, p.y);
    // });
    // ((pts) => {
    // drawPointsAnimateId =
    // window.requestAnimationFrame(() => {
    const isFirstPoint = points.length === 1;

    const prevPoint = isFirstPoint ? points[0] : points[points.length - 2];
    const latestPoint = points[points.length - 1];

    if (isFirstPoint) {
      tmpCtx.beginPath();
    }

    tmpCtx.moveTo(prevPoint.x, prevPoint.y);
    tmpCtx.lineTo(latestPoint.x, latestPoint.y);

    tmpCtx.stroke();
    // drawPointsAnimateId = null;
    // });
    // })(points);
  };

  const savePointsToLine = () => {
    lines.push(points);
    points.length = 0;
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

  const loop = (once = false) => {
    pointerHasMoved = false;
    if (!once) {
      window.requestAnimationFrame(() => {
        loop();
      });
    }
  };

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
