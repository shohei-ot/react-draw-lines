import { Point } from '../interface';

export const getPoint = (
  ev: MouseEvent | TouchEvent,
  prevIdentifier?: number
): Point => {
  const e = (() => {
    const isTouchEvent = 'touches' in ev;
    const existPrevPoint = typeof prevIdentifier !== 'undefined';

    if (isTouchEvent) {
      if (existPrevPoint) {
        return Array.from(ev.changedTouches).find(
          (touch) => touch.identifier === prevIdentifier
        );
      }
      return ev.changedTouches[0];
    } else {
      return ev;
    }
  })();

  if (!e) {
    throw new Error(`evnet Object を取得できませんでした (${typeof e})`);
  }

  const target = e.target as HTMLCanvasElement | null;
  if (!target) {
    console.error(ev);
    throw new Error('引数に target が不在');
  }

  const rect = target.getBoundingClientRect();

  const x = 'offsetX' in e ? e.offsetX : e.clientX - rect.left;
  const y = 'offsetY' in e ? e.offsetY : e.clientY - rect.top;
  const force = 'force' in e ? e.force : 1;
  const identifier = 'identifier' in e ? e.identifier : 0;

  const point = {
    x,
    y,
    force,
    identifier,
  };
  return point;
};
