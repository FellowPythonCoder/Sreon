/**
 * Sreon brand geometry.
 *
 * Every Sreon mark is derived from one construction: two tangent arcs of equal
 * radius stacked on a shared vertical axis (the "aperture S"), drawn as a
 * monoline with round terminals. The same construction, scaled down, is reused
 * for the S of the wordmark, so the logo is internally consistent at any size.
 *
 * Canvas for all icon art is a 1024 x 1024 grid.
 */

export const palette = {
  violet: '#6C4CF1',
  violetDeep: '#2E1A63',
  violetMid: '#4B2FBA',
  lavender: '#C3B2FF',
  cream: '#F7EFE2',
  softWhite: '#FCFBF9',
  ink: '#121018',
  gray: '#8B8794',
};

const rad = (deg) => (deg * Math.PI) / 180;

/**
 * The aperture S.
 * Two arcs (rx, ry) tangent at the optical centre, with round caps.
 */
export function aperturePath({
  cx = 512,
  cy = 512,
  rx = 152,
  ry = 138,
  startDeg = -54,
  endDeg = 126,
} = {}) {
  const topCy = cy - ry;
  const botCy = cy + ry;
  const start = [cx + rx * Math.cos(rad(startDeg)), topCy + ry * Math.sin(rad(startDeg))];
  const end = [cx + rx * Math.cos(rad(endDeg)), botCy + ry * Math.sin(rad(endDeg))];
  const f = (n) => Number(n.toFixed(2));
  return [
    `M ${f(start[0])} ${f(start[1])}`,
    `A ${rx} ${ry} 0 1 0 ${cx} ${f(cy)}`,
    `A ${rx} ${ry} 0 1 1 ${f(end[0])} ${f(end[1])}`,
  ].join(' ');
}

/** Orbit dot: the single counterweight that makes the mark read as Sreon, not an S. */
export function orbitDot({ cx = 512, cy = 512, rx = 152, ry = 138, r = 40 } = {}) {
  return { cx: cx + rx * Math.cos(rad(-54)) + 6, cy: cy - ry + ry * Math.sin(rad(-54)) - 96, r };
}

/**
 * Apple-style squircle (continuous corner curvature) as a path.
 * size = edge length, offset = top-left origin.
 */
export function squircle(size, offset = 0, smoothing = 0.6) {
  const r = size * 0.2237;
  const c = r * smoothing;
  const o = offset;
  const s = size;
  const f = (n) => Number(n.toFixed(2));
  return [
    `M ${f(o + r)} ${f(o)}`,
    `L ${f(o + s - r)} ${f(o)}`,
    `C ${f(o + s - c)} ${f(o)} ${f(o + s)} ${f(o + c)} ${f(o + s)} ${f(o + r)}`,
    `L ${f(o + s)} ${f(o + s - r)}`,
    `C ${f(o + s)} ${f(o + s - c)} ${f(o + s - c)} ${f(o + s)} ${f(o + s - r)} ${f(o + s)}`,
    `L ${f(o + r)} ${f(o + s)}`,
    `C ${f(o + c)} ${f(o + s)} ${f(o)} ${f(o + s - c)} ${f(o)} ${f(o + s - r)}`,
    `L ${f(o)} ${f(o + r)}`,
    `C ${f(o)} ${f(o + c)} ${f(o + c)} ${f(o)} ${f(o + r)} ${f(o)}`,
    'Z',
  ].join(' ');
}

/* ------------------------------------------------------------------ *
 * Monoline geometric wordmark: S R E O N
 * Drawn on a baseline grid so it can be stroked with one weight.
 * Cap height 100, stroke 16, drawn left to right with 30 tracking.
 * ------------------------------------------------------------------ */
export function wordmark({ x = 0, y = 0, cap = 100, weight = 15, tracking = 30 } = {}) {
  const h = cap;
  const w = h * 0.62; // letter width
  const r = w / 2;
  const f = (n) => Number(n.toFixed(2));
  const parts = [];
  let cursor = x;

  const advance = (width) => {
    const at = cursor;
    cursor += width + tracking;
    return at;
  };

  // S — the aperture construction, scaled to cap height
  {
    const ox = advance(w);
    const ry = h / 4;
    const rx = w / 2;
    const cx = ox + rx;
    const cy = y + h / 2;
    parts.push(
      aperturePath({ cx, cy, rx, ry, startDeg: -56, endDeg: 124 })
    );
  }
  // R
  {
    const ox = advance(w);
    const bowl = h * 0.29;
    parts.push(`M ${f(ox)} ${f(y + h)} L ${f(ox)} ${f(y)} L ${f(ox + w - bowl)} ${f(y)}`);
    parts.push(
      `M ${f(ox + w - bowl)} ${f(y)} A ${f(bowl)} ${f(bowl)} 0 0 1 ${f(ox + w - bowl)} ${f(y + bowl * 2)} L ${f(ox)} ${f(y + bowl * 2)}`
    );
    parts.push(`M ${f(ox + w * 0.52)} ${f(y + bowl * 2)} L ${f(ox + w)} ${f(y + h)}`);
  }
  // E
  {
    const ox = advance(w * 0.86);
    const ew = w * 0.86;
    parts.push(`M ${f(ox + ew)} ${f(y)} L ${f(ox)} ${f(y)} L ${f(ox)} ${f(y + h)} L ${f(ox + ew)} ${f(y + h)}`);
    parts.push(`M ${f(ox)} ${f(y + h / 2)} L ${f(ox + ew * 0.82)} ${f(y + h / 2)}`);
  }
  // O
  {
    const ox = advance(w * 1.04);
    const ow = w * 1.04;
    const rxo = ow / 2;
    const ryo = h / 2;
    const cx = ox + rxo;
    const cy = y + ryo;
    parts.push(
      `M ${f(cx)} ${f(cy - ryo)} A ${f(rxo)} ${f(ryo)} 0 1 1 ${f(cx - 0.01)} ${f(cy - ryo)} Z`
    );
  }
  // N
  {
    const ox = advance(w * 1.02);
    const nw = w * 1.02;
    parts.push(
      `M ${f(ox)} ${f(y + h)} L ${f(ox)} ${f(y)} L ${f(ox + nw)} ${f(y + h)} L ${f(ox + nw)} ${f(y)}`
    );
  }

  return { d: parts.join(' '), width: cursor - tracking - x, weight };
}
