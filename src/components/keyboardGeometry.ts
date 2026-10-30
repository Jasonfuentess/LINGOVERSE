// Only reveal what is obscured; oversized groups prioritize their input at the top.
export function revealDelta(top: number, height: number, viewportTop: number, viewportBottom: number): number {
  const available = viewportBottom - viewportTop;
  if (available <= 0 || height <= 0) return 0;
  if (height > available) return top > viewportTop || top + height < viewportTop ? top - viewportTop : 0;
  if (top < viewportTop) return top - viewportTop;
  return Math.max(0, top + height - viewportBottom);
}
export function viewportObstruction(layoutHeight: number, height: number, offsetTop: number, scale: number): number {
  return scale === 1 ? Math.max(0, layoutHeight - height - offsetTop) : 0;
}
