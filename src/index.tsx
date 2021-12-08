import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { getPoint } from './libs/get-point';
import {
  CanvasDrawingStyle,
  CanvasLayerName,
  DrawEvent,
  IDrawLineHandle,
  MappedConst,
  Point,
} from './interface';
import { lineOrganizer } from './libs/line-organizer';

export type Props = {
  id?: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor?: string; // container background color
  onChange?: (out: { imgUrl: string }) => void;

  // canvas drawing options
  usePressure?: boolean; // for touch control (default: fales)
  lineWidth?: number; // default: 10
  minLineWidth?: number; // default: 1
  strokeStyle?: string; // Stroke Color. (default: #000)
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

// const CANVAS_TRANSLATE = 0.5;
const CANVAS_TRANSLATE = 0.5;

const CANVAS_LAYER: MappedConst<CanvasLayerName> = {
  DRAWING_HISTORY: 'DRAWING_HISTORY',
  ORGANIZED_LINE: 'ORGANIZED_LINE',
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
    ORGANIZED_LINE: useRef<HTMLCanvasElement | null>(null),
    TMP: useRef<HTMLCanvasElement | null>(null),
    USER_INTERFACE: useRef<HTMLCanvasElement | null>(null),
  };

  const [tmpCtxTranslated, setTmpCtxTranslated] = useState(false);
  const [tmpOrganizedLineCtxTranslated, setOrganizedLineCtxTranslated] =
    useState(false);

  // ポインターが移動した事を示すフラグ
  // const [pointerHasMoved, setPointerHasMoved] = useState(false);

  // 線を引いているフラグ
  const [drawingStarted, setDrawingStarted] = useState(false);

  // 引かれた線
  // const [lines, setLines] = useState<Point[][]>([]);

  // mouseDown, touchStart の point
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  // 引いている線を表現する整形済みポイントの配列
  // const [points, setPoints] = useState<Point[]>([]);
  let points: Point[] = [];
  const setPoints = (argPoints: Point[]) => {
    points = argPoints;
  };

  // 補間済みのポイントの配列
  const [organizedPoints, setOrganizedPoints] = useState<Point[]>([]);

  // useEffect(() => {
  //   if (organizedPoints.length > 0) {
  //     // organized-points の描画
  //     drawOrganizedLine(organizedPoints);
  //     // drawing-history への転写
  //     transcribeOrganizedLineToDrawingHistory();
  //     clearCanvas(['ORGANIZED_LINE']);
  //     // onChange の emit
  //     handleOnChange();
  //     // organized-points のクリア
  //     setOrganizedPoints([]);
  //   }
  // }, [organizedPoints]);

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
    // setLines([]);
    layerNames.forEach((k) => {
      const canvasEl = canvasRefs[k].current;
      if (!canvasEl) return;
      const ctx = canvasEl.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, props.canvasWidth, props.canvasHeight);
    });
    handleOnChange();
  };

  const handleDrawStart = (e: DrawEvent) => {
    // console.debug('> START handleDrawStart');
    if (drawingStarted) {
      // console.debug('> ABORT handleDrawStart');
      return;
    }

    setDrawingStarted(true);

    // addPoint(getPoint(e.nativeEvent));
    setStartPoint(getPoint(e.nativeEvent));
    drawPoints(points);

    // setPointerHasMoved(true);
    // console.debug('> END handleDrawStart');
  };

  const handleDrawMove = (e: DrawEvent) => {
    if (!drawingStarted) {
      return;
    }
    // console.debug('> START handleDrawMove');

    if (!startPoint) {
      throw new Error('startPoint が null');
    }

    addPoint(getPoint(e.nativeEvent, startPoint.identifier));
    drawPoints(points);

    // setPointerHasMoved(true);
    // console.debug('> END handleDrawMove');
  };

  const handleDrawEnd = (e: DrawEvent) => {
    // console.debug('> START handleDrawEnd');
    if (!drawingStarted) {
      // console.debug('> ABORT handleDrawEnd');
      return;
    }

    if (!startPoint) {
      throw new Error('startPoint が null');
    }

    addPoint(getPoint(e.nativeEvent, startPoint.identifier));
    drawPoints(points);
    // curveInterpolation();
    // FIXME: points を state で管理しない方がいいかもしれない。実行と完了のタイミングが非同期なので、 genOrganizePoints の戻りがおかしくなるっぽい。
    setOrganizedPoints(genOrganizePoints(points));
    // drawOrganizedLine(organizedPoints);
    new Promise(() => {
      drawOrganizedLine(organizedPoints);
      // drawing-history への転写
      transcribeOrganizedLineToDrawingHistory();
      clearCanvas(['ORGANIZED_LINE']);
      // onChange の emit
      handleOnChange();
      // organized-points のクリア
      setOrganizedPoints([]);
    });
    clearPoints();
    clearCanvas(['TMP']);
    // savePointsToLine();
    // transcribeOrganizedLineToDrawingHistory();
    // clearCanvas(['ORGANIZED_LINE']);

    setDrawingStarted(false);
    // setPointerHasMoved(true);

    // handleOnChange();
    setStartPoint(null);
    // console.debug('> END handleDrawEnd');
  };

  const genOrganizePoints = (points: Point[]): Point[] => {
    return lineOrganizer(points);
  };
  const clearPoints = () => {
    setPoints([]);
  };

  const handleOnChange = () => {
    if (!props.onChange) return;

    const canvas = canvasRefs.DRAWING_HISTORY.current;
    if (!canvas) return;

    const imgUrl = canvas.toDataURL('image/png');
    props.onChange({ imgUrl });
  };

  const addPoint = (point: Point): Point[] => {
    // console.debug('> START addPoint');
    // console.debug('point', { ...point });
    if (points.length === 0) {
      points.push(point);
      setPoints([...points]);
    } else {
      points.push(point);

      // const organizedPoints = lineOrganizer(points);
      // points.push(...organizedPoints);

      setPoints([...points]);
      // setInterpolatedPoints([...organizedPoints]);
    }
    // console.debug('> END addPoint');
    return points;
  };

  const drawPoints = (points: Point[]) => {
    // drawDiffLine();
    drawAllPoints(points);
  };

  const getCanvasStyles = (): CanvasDrawingStyle => ({
    lineCap: props.lineCap ?? CANVAS_CONTEXT_STYLE.lineCap,
    lineJoin: props.lineJoin ?? CANVAS_CONTEXT_STYLE.lineJoin,
    strokeStyle: props.strokeStyle ?? CANVAS_CONTEXT_STYLE.strokeStyle,
    lineWidth: props.lineWidth ?? CANVAS_CONTEXT_STYLE.lineWidth,
    minLineWidth: props.minLineWidth ?? CANVAS_CONTEXT_STYLE.minLineWidth,
  });

  const drawAllPoints = async (points: Point[]) => {
    if (points.length === 0) return;
    // console.debug('interpolatedPoints', interpolatedPoints);
    if (!canvasRefs.TMP.current) return;
    const tmpCtx = canvasRefs.TMP.current.getContext('2d');
    if (!tmpCtx) return;

    console.debug('drawAllPoints', points);

    // let latestForce = 0.1;
    // const updateLatestForce = (x: number, y: number): number => {
    //   const p = points.find((p) => p.x === x && p.y === y);
    //   if (p) latestForce = p.force;
    //   return latestForce;
    // };

    const {
      lineCap,
      lineJoin,
      strokeStyle,
      lineWidth: baseLineWidth,
      minLineWidth,
    } = getCanvasStyles();

    tmpCtx.lineCap = lineCap;
    tmpCtx.lineJoin = lineJoin;
    tmpCtx.strokeStyle = strokeStyle;

    if (!tmpCtxTranslated) {
      tmpCtx.translate(CANVAS_TRANSLATE, CANVAS_TRANSLATE);
      setTmpCtxTranslated(true);
    }

    tmpCtx.beginPath();
    tmpCtx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length; i++) {
      const { x, y, force } = points[i];
      const lineWidth = baseLineWidth * (props.usePressure ? force || 1 : 1);
      tmpCtx.lineWidth = lineWidth > minLineWidth ? lineWidth : minLineWidth;
      tmpCtx.lineTo(x, y);
    }

    tmpCtx.stroke();
  };

  // organized-line を ORGANIZED_LINE に描写する
  const drawOrganizedLine = (points: Point[]) => {
    const canvasEl = canvasRefs.ORGANIZED_LINE.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    console.debug('drawOrganizedLine', points);

    const {
      lineCap,
      lineJoin,
      strokeStyle,
      lineWidth: baseLineWidth,
      minLineWidth,
    } = getCanvasStyles();

    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;
    ctx.strokeStyle = strokeStyle;

    if (!tmpOrganizedLineCtxTranslated) {
      ctx.translate(CANVAS_TRANSLATE, CANVAS_TRANSLATE);
      setOrganizedLineCtxTranslated(true);
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length; i++) {
      const { x, y, force } = points[i];
      const lineWidth = baseLineWidth * (props.usePressure ? force || 1 : 1);
      ctx.lineWidth = lineWidth > minLineWidth ? lineWidth : minLineWidth;
      ctx.lineTo(x, y);
    }

    ctx.stroke();
  };

  // const drawDiffLine = () => {
  //   if (points.length === 0) return;
  //   if (!canvasRefs.TMP.current) return;
  //   const tmpCtx = canvasRefs.TMP.current.getContext('2d');
  //   if (!tmpCtx) return;

  //   const isFirstPoint = points.length === 1;

  //   const prevPoint = isFirstPoint ? points[0] : points[points.length - 2];
  //   const latestPoint = points[points.length - 1];

  //   if (!ctxTranslated) {
  //     tmpCtx.translate(CANVAS_TRANSLATE, CANVAS_TRANSLATE);
  //     setCtxTranslated(true);
  //   }

  //   if (isFirstPoint) {
  //     tmpCtx.beginPath();
  //   }

  //   // canvas styles
  //   tmpCtx.lineWidth =
  //     (props.lineWidth ?? CANVAS_CONTEXT_STYLE.lineWidth) *
  //     (props.usePressure ? latestPoint.force : 1);
  //   tmpCtx.lineCap = props.lineCap ?? CANVAS_CONTEXT_STYLE.lineCap;
  //   tmpCtx.lineJoin = props.lineJoin ?? CANVAS_CONTEXT_STYLE.lineJoin;
  //   tmpCtx.strokeStyle = props.strokeStyle ?? CANVAS_CONTEXT_STYLE.strokeStyle;

  //   tmpCtx.moveTo(prevPoint.x, prevPoint.y);
  //   tmpCtx.lineTo(latestPoint.x, latestPoint.y);

  //   tmpCtx.stroke();
  // };

  // const savePointsToLine = () => {
  //   lines.push([...organizedPoints]);
  //   setLines([...lines]);
  //   setPoints([]);
  //   setOrganizedPoints([]);
  // };

  const transcribeOrganizedLineToDrawingHistory = () => {
    if (
      !canvasRefs.DRAWING_HISTORY.current ||
      !canvasRefs.ORGANIZED_LINE.current
    )
      return;

    const tmpCtx = canvasRefs.ORGANIZED_LINE.current.getContext('2d');
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
      ctx.clearRect(
        CANVAS_TRANSLATE * -1,
        CANVAS_TRANSLATE * -1,
        props.canvasWidth,
        props.canvasHeight
      );
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
      id={props.id}
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
