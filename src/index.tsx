import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { getPoint } from './libs/get-point';
import { linerInterpolationByPressure } from './libs/liner-interpolation';

export type Props = {
  // canvas[width]
  canvasWidth: number;
  // canvas[height]
  canvasHeight: number;
  // div.container[style="background-color: {HERE} ;"]
  backgroundColor?: string;
  // onChange?: (out: { lines: Point[][]; imgUrl: string }) => void;
  onChange?: (out: { imgUrl: string }) => void;

  // canvas drawing options
  usePressure?: boolean; // for touch control
  lineWidth?: number; // default: 10
  minLineWidth?: number; // default: 1
  strokeStyle?: string; // Stroke Color. default: #000
  canvasBackgroundImg?: HTMLImageElement; // url
  lineCap?: CanvasLineCap; // default: round
  lineJoin?: CanvasLineJoin; // default: round
};

const CANVAS_CONTEXT_STYLE: CanvasDrawingStyle = {
  lineWidth: 10,
  minLineWidth: 1,
  lineCap: 'round',
  lineJoin: 'round',
  strokeStyle: '#000',
};

export type Point = {
  x: number;
  y: number;
  force: number; // 0.0 ~ 1.0
  identifier: number;
};

export type Line = {
  start: Point;
  end: Point;
};

export type CanvasDrawingStyle = {
  lineWidth: number;
  minLineWidth: number;
  strokeStyle: string;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
};

export type MappedConst<T extends string> = { [key in T]: key };

type DrawEvent =
  | React.MouseEvent<HTMLCanvasElement, MouseEvent>
  | React.TouchEvent<HTMLCanvasElement>;

export interface IDrawLineHandle {
  eraseAllCanvas(): void;
}

type CanvasLayerName = 'DRAWING_HISTORY' | 'TMP' | 'USER_INTERFACE';

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

const DrawLine: React.ForwardRefRenderFunction<IDrawLineHandle, Props> = (
  props: Props,
  ref
): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    eraseAllCanvas: () => {
      eraseAllCanvas();
    },
  }));

  const canvasRefs: CanvasLayerRefs = {
    DRAWING_HISTORY: useRef<HTMLCanvasElement | null>(null),
    TMP: useRef<HTMLCanvasElement | null>(null),
    USER_INTERFACE: useRef<HTMLCanvasElement | null>(null),
  };

  const [ctxTranslated, setCtxTranslated] = useState(false);

  // ポインターが移動した事を示すフラグ
  // const [pointerHasMoved, setPointerHasMoved] = useState(false);

  // 線を引いているフラグ
  const [drawingStarted, setDrawingStarted] = useState(false);

  // 引かれた線
  const [lines, setLines] = useState<Point[][]>([]);

  // 引いている線を表現する整形済みポイントの配列
  const [points, setPoints] = useState<Point[]>([]);

  const setCanvasBackgroundImg = (imgEl: HTMLImageElement) => {
    const bgCanvasEl = canvasRefs.DRAWING_HISTORY.current;
    if (!bgCanvasEl) {
      return;
    }

    const bgCanvasCtx = bgCanvasEl.getContext('2d');
    if (!bgCanvasCtx) {
      return;
    }

    bgCanvasCtx.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height);
  };

  useEffect(() => {
    if (props.canvasBackgroundImg) {
      setCanvasBackgroundImg(props.canvasBackgroundImg);
      handleOnChange();
    }
  }, [props.canvasBackgroundImg]);

  // 全消し機能www
  const eraseAllCanvas = () => {
    setPoints([]);
    setLines([]);
    layerNames.forEach((k) => {
      const canvasEl = canvasRefs[k].current;
      if (!canvasEl) return;
      const ctx = canvasEl.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, props.canvasWidth, props.canvasHeight);
    });
    handleOnChange();
  };

  // TODO: リサイズ機能

  const handleDrawStart = (e: DrawEvent) => {
    if (drawingStarted) {
      return;
    }

    setDrawingStarted(true);

    addPoint(getPoint(e.nativeEvent));
    drawPoints();

    // setPointerHasMoved(true);
  };

  const handleDrawMove = (e: DrawEvent) => {
    if (!drawingStarted) {
      return;
    }

    addPoint(getPoint(e.nativeEvent, points[points.length - 1]));
    drawPoints();

    // setPointerHasMoved(true);
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
    // setPointerHasMoved(true);

    handleOnChange();
  };

  const handleOnChange = () => {
    if (!props.onChange) return;

    const canvas = canvasRefs.DRAWING_HISTORY.current;
    if (!canvas) return;

    const imgUrl = canvas.toDataURL('image/png');
    props.onChange({ imgUrl });
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
    tmpCtx.lineWidth =
      (props.lineWidth ?? CANVAS_CONTEXT_STYLE.lineWidth) *
      (props.usePressure ? latestPoint.force : 1);
    tmpCtx.lineCap = props.lineCap ?? CANVAS_CONTEXT_STYLE.lineCap;
    tmpCtx.lineJoin = props.lineJoin ?? CANVAS_CONTEXT_STYLE.lineJoin;
    tmpCtx.strokeStyle = props.strokeStyle ?? CANVAS_CONTEXT_STYLE.strokeStyle;

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
      ctx.clearRect(-0.5, -0.5, props.canvasWidth, props.canvasHeight);
    });
  };

  // const loop = (once = false) => {
  //   setPointerHasMoved(false);
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
            style={{ display: 'block', position: 'absolute' }}
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

const WrappedDrawLine = forwardRef(DrawLine);

export default WrappedDrawLine;
