#!/usr/bin/env node
/**
 * Generates every Sreon SVG brand source into /brand.
 * Run: npm run brand   (or node scripts/make-brand.mjs)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aperturePath, orbitDot, palette, squircle, wordmark } from './brand-geometry.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'brand');
mkdirSync(out, { recursive: true });

const MARK = aperturePath();
const DOT = orbitDot();
const STROKE = 116;

const gradients = (id = 'g') => `
  <defs>
    <linearGradient id="${id}-tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5B39E8"/>
      <stop offset="0.55" stop-color="#3E24A6"/>
      <stop offset="1" stop-color="#22114F"/>
    </linearGradient>
    <linearGradient id="${id}-mark" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="${palette.softWhite}"/>
      <stop offset="1" stop-color="${palette.cream}"/>
    </linearGradient>
    <linearGradient id="${id}-inkmark" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="#7B5CFF"/>
      <stop offset="1" stop-color="#4B2FBA"/>
    </linearGradient>
    <radialGradient id="${id}-glow" cx="0.3" cy="0.16" r="0.85">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.34"/>
      <stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

/** The mark drawn inside a 1024 grid. */
const markGroup = (fill, { dot = true, dotFill = palette.lavender, stroke = STROKE } = {}) => `
  <path d="${MARK}" fill="none" stroke="${fill}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>
  ${dot ? `<circle cx="${DOT.cx.toFixed(2)}" cy="${DOT.cy.toFixed(2)}" r="${DOT.r}" fill="${dotFill}"/>` : ''}`;

const svg = (body, { size = 1024, w = size, h = size, viewBox = `0 0 ${w} ${h}` } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${viewBox}" fill="none">${body}
</svg>
`;

/* ------------------------------------------------------------------ */
/* App icon — macOS grid (824 content on a 1024 canvas)                */
/* ------------------------------------------------------------------ */
const macIcon = svg(`${gradients('a')}
  <g transform="translate(0,0)">
    <path d="${squircle(824, 100)}" fill="url(#a-tile)"/>
    <path d="${squircle(824, 100)}" fill="url(#a-glow)"/>
    <path d="${squircle(824, 100)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="3"/>
    <g transform="translate(512,512) scale(0.74) translate(-512,-512)">
      ${markGroup('url(#a-mark)')}
    </g>
  </g>`);

/* Full-bleed tile — Windows / Linux / favicon */
const squareIcon = svg(`${gradients('b')}
  <path d="${squircle(1024, 0)}" fill="url(#b-tile)"/>
  <path d="${squircle(1024, 0)}" fill="url(#b-glow)"/>
  <g transform="translate(512,512) scale(0.86) translate(-512,-512)">
    ${markGroup('url(#b-mark)')}
  </g>`);

/* Bare mark, transparent background, gradient violet (light UI) */
const markLight = svg(`${gradients('c')}
  <g>${markGroup('url(#c-inkmark)', { dotFill: palette.violet })}</g>`);

/* Bare mark, cream (dark UI) */
const markDark = svg(`${gradients('d')}
  <g>${markGroup('url(#d-mark)', { dotFill: palette.lavender })}</g>`);

/* Monochrome mark — inherits currentColor */
const markMono = svg(`<g>${markGroup('currentColor', { dotFill: 'currentColor' })}</g>`);

/* ------------------------------------------------------------------ */
/* Lockups: mark + wordmark                                            */
/* ------------------------------------------------------------------ */
function lockup({ markFill, wordFill, dotFill, id }) {
  const cap = 132;
  const wm = wordmark({ x: 0, y: 0, cap, weight: 19, tracking: 26 });
  const markScale = 0.55; // 1024 grid -> lockup height
  const markSize = 1024 * markScale;
  const gap = 78;
  const totalW = markSize * 0.46 + gap + wm.width;
  const h = markSize;
  const body = `${gradients(id)}
  <g transform="scale(${markScale})">
    <g transform="translate(-232,0)">${markGroup(markFill, { dotFill })}</g>
  </g>
  <g transform="translate(${(markSize * 0.46 + gap).toFixed(1)}, ${((h - cap) / 2).toFixed(1)})">
    <path d="${wm.d}" fill="none" stroke="${wordFill}" stroke-width="${wm.weight}" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
  return svg(body, { w: Math.round(totalW), h: Math.round(h), viewBox: `0 0 ${Math.round(totalW)} ${Math.round(h)}` });
}

const logoLight = lockup({ markFill: 'url(#e-inkmark)', wordFill: palette.ink, dotFill: palette.violet, id: 'e' });
const logoDark = lockup({ markFill: 'url(#f-mark)', wordFill: palette.cream, dotFill: palette.lavender, id: 'f' });
const logoMono = lockup({ markFill: 'currentColor', wordFill: 'currentColor', dotFill: 'currentColor', id: 'g' });

/* ------------------------------------------------------------------ */
/* Loading mark — the aperture, animated                               */
/* ------------------------------------------------------------------ */
const loading = svg(`${gradients('h')}
  <g transform="translate(512,512)">
    <g>
      <circle r="392" fill="none" stroke="${palette.lavender}" stroke-opacity="0.22" stroke-width="44"/>
      <circle r="392" fill="none" stroke="url(#h-inkmark)" stroke-width="44" stroke-linecap="round"
        stroke-dasharray="620 1842" transform="rotate(-90)">
        <animateTransform attributeName="transform" type="rotate" from="-90" to="270" dur="1.15s" repeatCount="indefinite"/>
      </circle>
    </g>
    <g transform="scale(0.52)">
      <g transform="translate(-512,-512)">${markGroup('url(#h-inkmark)', { dot: false })}</g>
    </g>
  </g>`);

/* Favicon — 64 grid, heavier stroke so it survives 16px */
const favicon = svg(`${gradients('i')}
  <path d="${squircle(64, 0)}" fill="url(#i-tile)"/>
  <g transform="scale(0.0625)">
    <g transform="translate(512,512) scale(0.92) translate(-512,-512)">
      ${markGroup('url(#i-mark)', { dot: true, stroke: 132 })}
    </g>
  </g>`, { size: 64 });

const files = {
  'sreon-icon.svg': macIcon,
  'sreon-icon-square.svg': squareIcon,
  'sreon-mark.svg': markLight,
  'sreon-mark-dark.svg': markDark,
  'sreon-mark-mono.svg': markMono,
  'sreon-logo.svg': logoLight,
  'sreon-logo-dark.svg': logoDark,
  'sreon-logo-mono.svg': logoMono,
  'sreon-loading.svg': loading,
  'sreon-favicon.svg': favicon,
};

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(out, name), content);
  console.log('brand ->', name);
}
