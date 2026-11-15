const h2r = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, u: number) => {
  const A = h2r(a), B = h2r(b); u = Math.max(0, Math.min(1, u));
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, '0')).join('');
};
export const INK = '#151515';
export const WATER = '#3FA7F5';
export const WATER_DEEP = '#2A86D9';
