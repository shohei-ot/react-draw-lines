import { Point } from '../interface';

export const getPoint = (
  ev: MouseEvent | TouchEvent,
  touchesIndex = 0
): Point => {
  const isTouchEvent = 'touches' in ev;

  const e = isTouchEvent ? ev.touches[touchesIndex] : ev;

  const target = e.target as HTMLCanvasElement | null;
  if (!target) {
    console.error(ev);
    throw new Error('引数に target が不在');
  }

  const rect = target.getBoundingClientRect();

  const x = e.pageX - rect.left;
  const y = e.pageY - rect.top;
  const force = 'force' in e ? e.force : 1;

  return {
    x,
    y,
    force,
  };
};
