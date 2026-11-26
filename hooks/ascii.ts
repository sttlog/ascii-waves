// Shared pieces for drawing scenes out of monospace characters.

export const W = 1600
export const H = 900
export const CX = W / 2
export const FS = 16
export const CW = FS * 0.6
export const COLS = Math.ceil(W / CW) + 6

export const f = (n: number) => n.toFixed(1)

/** Escapes markup and keeps spaces from collapsing inside SVG text. */
export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, ' ')

/** A small seeded random, so each scene comes out the same every time. */
export function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

export const pick = <T>(r: () => number, list: readonly T[]): T => list[Math.floor(r() * list.length)] as T

/** Animation timing for one element. */
export const timing = (dur: number, delay: number) =>
  `style="animation-duration:${dur.toFixed(1)}s;animation-delay:-${delay.toFixed(1)}s"`

export const text = (x: number, y: number, s: string, cls: string, attrs = '') =>
  `<text x="${f(x)}" y="${f(y)}" class="${cls}"${attrs ? ' ' + attrs : ''}>${esc(s)}</text>`

/** A row centred on the scene: every row of COLS cells lines up with the others. */
export const row = (y: number, s: string, cls: string, attrs = '') => text(CX, y, s, `${cls} mid`, attrs)

/** Several lines of ASCII art, left-aligned at x. */
export const art = (x: number, y: number, lines: readonly string[], cls: string, lh = FS * 1.15) =>
  lines.map((l, i) => text(x, y + i * lh, l, cls)).join('')

export const blank = () => new Array<string>(COLS).fill(' ')

/** A vertical gradient; stops are [offset, color, opacity?]. */
export const grad = (id: string, stops: [number, string, number?][], extra = 'x1="0" y1="0" x2="0" y2="1"') =>
  `<linearGradient id="${id}" ${extra}>${stops
    .map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`)
    .join('')}</linearGradient>`

export const glow = (id: string, sd: number) =>
  `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${sd}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`

/** Twinkling stars scattered between y0 and y1. */
export function stars(r: () => number, n: number, y0: number, y1: number, skip?: (x: number, y: number) => boolean) {
  const glyphs = ['.', '.', '.', '+', '*', "'"]
  let out = ''
  for (let i = 0; i < n; i++) {
    const x = r() * W
    const y = y0 + r() * (y1 - y0)
    if (skip?.(x, y)) continue
    out += text(x, y, pick(r, glyphs), `star s${1 + Math.floor(r() * 3)}`, timing(8 + r() * 7, r() * 10))
  }
  return out
}

/** An outlined cloud: ( ) - _ traced around a few overlapping puffs. */
export function cloud(r: () => number, w: number, h: number): string[] {
  const puffs = Array.from({ length: 3 + Math.floor(r() * 3) }, () => ({
    cx: w * (0.2 + 0.6 * r()),
    cy: h * 0.62,
    rad: h * (0.32 + 0.38 * r()),
  }))
  const flat = h * 0.92
  const inside = (c: number, y: number) =>
    y >= 0 && y < flat && puffs.some(p => ((c - p.cx) / 1.6) ** 2 + (y - p.cy) ** 2 <= p.rad ** 2)
  const lines: string[] = []
  for (let y = 0; y < h; y++) {
    let s = ''
    for (let c = 0; c < w; c++) {
      if (!inside(c, y)) s += ' '
      else if (!inside(c - 1, y)) s += '('
      else if (!inside(c + 1, y)) s += ')'
      else if (!inside(c, y + 1)) s += '_'
      else if (!inside(c, y - 1)) s += '-'
      else s += ' '
    }
    lines.push(s)
  }
  return lines
}

/**
 * A mountain or hill range in characters: a dark mass, sparse texture,
 * an optional cap (snow) just under the ridge, and ridge glyphs on top.
 */
export function range(o: {
  heights: number[]
  base: number
  lh: number
  mass: string
  ridge: string
  body: string
  bodyChars: string
  cap?: string
  capDepth?: number
}) {
  const { heights, base, lh } = o
  const top = Math.max(...heights)
  let poly = `M-20 ${base}`
  heights.forEach((h, c) => {
    poly += ` L${f(CX + (c - COLS / 2) * CW)} ${f(base - h * lh + 4)}`
  })
  poly += ` L${W + 20} ${base} Z`
  let ridge = ''
  let body = ''
  let cap = ''
  for (let r = top; r >= 1; r--) {
    const rc = blank()
    const bc = blank()
    const cc = blank()
    heights.forEach((h, c) => {
      if (h < r) return
      if (h === r) {
        const l = heights[c - 1] ?? 0
        const rt = heights[c + 1] ?? 0
        rc[c] = rt > h && l <= h ? '/' : l > h && rt <= h ? '\\' : l < h && rt < h ? '^' : '_'
      } else if (o.cap && h - r <= (o.capDepth ?? 1)) {
        cc[c] = (c + r) % 2 ? '*' : '.'
      } else if ((c * 7 + r * 3) % 5 === 0) {
        bc[c] = o.bodyChars[(c + r) % o.bodyChars.length] ?? '.'
      }
    })
    const y = base - (r - 1) * lh - 3
    ridge += row(y, rc.join(''), o.ridge)
    body += row(y, bc.join(''), o.body)
    if (o.cap) cap += row(y, cc.join(''), o.cap)
  }
  return `<path d="${poly}" class="${o.mass}"/>${body}${cap}${ridge}`
}

/**
 * A row of repeating glyphs that scrolls sideways forever: water, wind,
 * ripples. `unit` repeats; one loop moves it exactly one unit.
 */
export function scrollRow(id: string, y: number, unit: string, fs: number, cls: string, dur: number, dir: 1 | -1, opacity = 1) {
  const cw = fs * 0.6
  const dist = unit.length * cw
  const s = unit.repeat(Math.ceil((W + 2 * dist) / dist) + 1)
  return {
    css: `@keyframes ${id}{from{transform:translateX(0)}to{transform:translateX(${f(dir * dist)}px)}}`,
    svg: `<text x="${f(-dist)}" y="${f(y)}" class="${cls}" style="font-size:${f(fs)}px;opacity:${opacity.toFixed(2)};animation:${id} ${dur.toFixed(1)}s linear infinite">${esc(s)}</text>`,
  }
}

/** Motion every scene can use. Each moving part rests where its markup puts it. */
export const BASE_CSS = `
text { font-family: ui-monospace, Menlo, monospace; font-size: ${FS}px; white-space: pre; }
.mid { text-anchor: middle; }
.star { opacity: 0.6; animation: twinkle 9s ease-in-out infinite; }
.pulse { animation: pulse 6s ease-in-out infinite; }
.bob { animation: bob 7s ease-in-out infinite alternate; }
.skydrift { animation: skydrift 160s linear infinite; }
.rise { animation: rise 14s linear infinite; }
.fall { animation: fall 26s linear infinite; }
.waft { animation: waft 24s linear infinite; }
.swing { animation: swing 5s ease-in-out infinite alternate; }
.sway { transform-box: fill-box; transform-origin: 50% 100%; animation: sway 8s ease-in-out infinite alternate; }
.spin { transform-box: fill-box; transform-origin: 50% 50%; animation: spin 18s linear infinite; }
@keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; } }
@keyframes pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
@keyframes bob { from { transform: translateY(-7px); } to { transform: translateY(7px); } }
@keyframes skydrift { from { transform: translateX(-2100px); } to { transform: translateX(2100px); } }
@keyframes rise { 0% { transform: translateY(450px); opacity: 0; } 12% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translateY(-450px); opacity: 0; } }
@keyframes fall { 0% { transform: translateY(-450px); opacity: 0; } 12% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translateY(450px); opacity: 0; } }
@keyframes waft { 0% { transform: translateX(-700px); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translateX(700px); opacity: 0; } }
@keyframes swing { from { transform: translateX(-14px); } to { transform: translateX(14px); } }
@keyframes sway { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`

export const svg = (defs: string, css: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs><style>${BASE_CSS}${css}</style>${body}</svg>`
