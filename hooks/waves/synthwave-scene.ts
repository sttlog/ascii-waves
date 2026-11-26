// Builds the backdrop: a synthwave sunset where every shape is drawn with
// ASCII characters in a monospace font. Generated once, as an SVG string.

const W = 1600
const H = 900
const CX = W / 2
const HORIZON = 590
const FS = 16 // font size
const CW = FS * 0.6 // monospace glyph width
const COLS = Math.ceil(W / CW) + 6
const NBSP = ' ' // keeps spacing inside SVG text

// Every row is COLS wide and centred on CX, so columns line up row to row.
const row = (cells: string[]) => cells.join('').replace(/ /g, NBSP)
const blank = () => new Array<string>(COLS).fill(' ')
const colOf = (x: number) => Math.round((x - CX) / CW + COLS / 2)
const line = (y: number, text: string, cls: string) =>
  `<text x="${CX}" y="${y.toFixed(1)}" class="${cls}">${text}</text>`

// Small seeded random, so the scene is the same every time.
let seed = 7
const rand = () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}

// ---- stars ----
function stars(): string {
  const glyphs = ['.', '.', '.', '+', '*', "'"]
  let out = ''
  for (let i = 0; i < 110; i++) {
    const x = rand() * W
    const y = 18 + rand() * (HORIZON - 230)
    const g = glyphs[Math.floor(rand() * glyphs.length)] ?? '.'
    const tw = 1 + Math.floor(rand() * 3)
    const delay = (rand() * 9).toFixed(1)
    if (Math.hypot(x - CX, y - (HORIZON - 120)) < 250) continue // not over the sun
    out += `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" class="star tw${tw}" style="animation-delay:-${delay}s">${g}</text>`
  }
  return out
}

// ---- sun ----
function sun(): string {
  const R = 220
  const cy = HORIZON - 120
  const LH = 12
  let out = ''
  for (let y = cy - R + LH; y < HORIZON - 4; y += LH) {
    const dy = y - cy
    const half = Math.sqrt(Math.max(0, R * R - dy * dy))
    const n = Math.max(1, Math.round((2 * half) / CW))
    const fill = dy < -R * 0.75 ? ':' : dy < -R * 0.45 ? '=' : '#'
    out += line(y, fill.repeat(n), 'sun')
  }
  return out
}

// The sun's stripes: dark bars in its lower half that slide down, cut
// out of the sun with a mask.
const SUN_CY = HORIZON - 120
const STRIPE = 34
function stripeMask(): string {
  let bars = ''
  for (let y = SUN_CY - STRIPE; y < HORIZON + STRIPE; y += STRIPE) {
    const t = Math.max(0, (y - SUN_CY) / (HORIZON - SUN_CY)) // thicker lower down
    bars += `<rect x="0" y="${y}" width="${W}" height="${(3 + t * 9).toFixed(1)}" fill="#000"/>`
  }
  return `<mask id="stripes" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="#fff"/>
<g clip-path="url(#lowerhalf)"><g class="slide">${bars}</g></g>
</mask>
<clipPath id="lowerhalf"><rect x="0" y="${SUN_CY}" width="${W}" height="${HORIZON - SUN_CY}"/></clipPath>`
}

// Shooting stars: a head and a tail of dashes, crossing now and then.
function meteors(): string {
  const at: [number, number, number][] = [
    [1250, 90, 0],
    [700, 40, 7],
    [1500, 200, 13.5],
  ]
  return at
    .map(
      ([x, y, d]) =>
        `<g transform="translate(${x} ${y}) rotate(-24)"><text class="meteor" style="animation-delay:${d}s">*~-----.</text></g>`,
    )
    .join('')
}

// ---- mountains ----
function mountains(): string {
  const LH = 14
  const heights: number[] = []
  for (let c = 0; c < COLS; c++) {
    const x = (c - COLS / 2) * CW
    const ax = Math.abs(x)
    const mask = Math.min(1, Math.max(0, (ax - 190) / 300))
    const h =
      (7 + 4 * Math.sin(c * 0.11) + 3 * Math.sin(c * 0.29 + 1.3) + 1.5 * Math.sin(c * 0.53 + 0.4)) * mask
    heights.push(Math.max(0, Math.floor(h)))
  }
  const top = Math.max(...heights)
  let ridge = ''
  let body = ''
  let poly = `M0 ${HORIZON}`
  heights.forEach((h, c) => {
    const x = CX + (c - COLS / 2) * CW
    poly += ` L${x.toFixed(1)} ${(HORIZON - h * LH + 4).toFixed(1)}`
  })
  poly += ` L${W} ${HORIZON} Z`
  for (let r = top; r >= 1; r--) {
    const ridgeCells = blank()
    const bodyCells = blank()
    heights.forEach((h, c) => {
      if (h < r) return
      if (h === r) {
        const l = heights[c - 1] ?? 0
        const rt = heights[c + 1] ?? 0
        ridgeCells[c] = rt > h && l <= h ? '/' : l > h && rt <= h ? '\\' : l < h && rt < h ? '^' : '_'
      } else if ((c + r) % 3 === 0) {
        bodyCells[c] = r % 2 ? ':' : '.'
      }
    })
    const y = HORIZON - (r - 1) * LH - 3
    ridge += line(y, row(ridgeCells), 'ridge')
    body += line(y, row(bodyCells), 'rock')
  }
  return `<path d="${poly}" class="mass"/>${body}${ridge}`
}

// ---- floor grid ----
function floor(): string {
  const LH = 16
  const depth = H - HORIZON
  const S = 150
  let out = ''
  for (let y = HORIZON + LH; y <= H + LH; y += LH) {
    const d = y - HORIZON
    const cells = blank()
    for (let k = -60; k <= 60; k++) {
      const x = CX + (k * S * d) / depth
      const c = colOf(x)
      if (c < 0 || c >= COLS || cells[c] !== ' ') continue
      const step = (k * S * LH) / depth / CW // columns per row
      cells[c] = Math.abs(step) < 0.5 ? '|' : k < 0 ? '/' : '\\'
    }
    out += line(y, row(cells), 'grid')
  }
  // horizontal lines, drifting toward the viewer
  let lanes = ''
  const dash = '-'.repeat(COLS)
  for (let y = HORIZON - 26; y <= H + 40; y += 32) lanes += line(y, dash, 'lane')
  return `${out}<g mask="url(#fade)"><g class="drift">${lanes}</g></g>`
}

export const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#05051a"/><stop offset="0.45" stop-color="#0d0c38"/>
<stop offset="0.8" stop-color="#1d1260"/><stop offset="1" stop-color="#3a1670"/>
</linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#140a3a"/><stop offset="1" stop-color="#04030f"/>
</linearGradient>
<linearGradient id="sunfill" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZON - 340}" x2="0" y2="${HORIZON}">
<stop offset="0" stop-color="#ffe680"/><stop offset="0.5" stop-color="#ff9a4a"/><stop offset="1" stop-color="#ff3d8b"/>
</linearGradient>
<radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#ff4fa0" stop-opacity="0.35"/><stop offset="1" stop-color="#ff4fa0" stop-opacity="0"/>
</radialGradient>
<linearGradient id="fadegrad" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.25" stop-color="#fff" stop-opacity="0.5"/><stop offset="1" stop-color="#fff" stop-opacity="1"/>
</linearGradient>
<linearGradient id="scan" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#7cc4ff" stop-opacity="0"/><stop offset="0.5" stop-color="#7cc4ff" stop-opacity="0.07"/><stop offset="1" stop-color="#7cc4ff" stop-opacity="0"/>
</linearGradient>
${stripeMask()}
<mask id="fade"><rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#fadegrad)"/></mask>
<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
<feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
</defs>
<style>
text { font-family: ui-monospace, Menlo, monospace; font-size: ${FS}px; text-anchor: middle; white-space: pre; }
.star { fill: #a9d4ff; text-anchor: start; opacity: 0.6; animation: twinkle 9s ease-in-out infinite; }
.tw2 { animation-duration: 11s; fill: #ffffff; }
.tw3 { animation-duration: 14s; fill: #7fb2ff; }
.sun { fill: url(#sunfill); font-weight: 700; }
.sunwrap { animation: breathe 12s ease-in-out infinite; }
.mass { fill: #090826; }
.ridge { fill: #4cb8ff; font-weight: 700; }
.rock { fill: #2a4fa8; opacity: 0.7; }
.horizon { fill: #ff4fb0; font-weight: 700; }
.grid { fill: #3a7bff; opacity: 0.75; }
.lane { fill: #5fd0ff; font-weight: 700; }
.drift { animation: drift 3.5s linear infinite; }
.slide { animation: slide 5s linear infinite; }
.starfield { animation: wander 70s ease-in-out infinite alternate; }
.range { animation: sway 26s ease-in-out infinite alternate; }
.pulse { animation: pulse 6s ease-in-out infinite; }
.halo { transform-origin: ${CX}px ${SUN_CY}px; animation: swell 14s ease-in-out infinite; }
.meteor { fill: #cfe8ff; text-anchor: start; opacity: 0; animation: shoot 20s linear infinite; }
.scanline { opacity: 0; animation: scan 11s linear infinite; }
@keyframes twinkle { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.9; } }
@keyframes breathe { 0%, 100% { opacity: 0.92; } 50% { opacity: 1; } }
@keyframes drift { from { transform: translateY(0); } to { transform: translateY(32px); } }
@keyframes slide { from { transform: translateY(0); } to { transform: translateY(${STRIPE}px); } }
@keyframes wander { from { transform: translateX(-18px); } to { transform: translateX(18px); } }
@keyframes sway { from { transform: translateX(-10px); } to { transform: translateX(10px); } }
@keyframes pulse { 0%, 100% { opacity: 0.75; } 50% { opacity: 1; } }
@keyframes swell { 0%, 100% { transform: scale(1); opacity: 0.85; } 50% { transform: scale(1.08); opacity: 1; } }
@keyframes shoot {
  0% { transform: translateX(0); opacity: 0; }
  1% { opacity: 0.95; }
  6% { transform: translateX(-640px); opacity: 0; }
  100% { transform: translateX(-640px); opacity: 0; }
}
@keyframes scan { 0% { transform: translateY(-200px); opacity: 1; } 100% { transform: translateY(${H + 50}px); opacity: 1; } }
</style>
<rect width="${W}" height="${HORIZON}" fill="url(#sky)"/>
<rect y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#ground)"/>
<g class="starfield">${stars()}</g>
<g>${meteors()}</g>
<circle class="halo" cx="${CX}" cy="${SUN_CY}" r="380" fill="url(#halo)"/>
<g class="sunwrap" filter="url(#glow)"><g mask="url(#stripes)">${sun()}</g></g>
<g class="range">${mountains()}</g>
<g class="pulse" filter="url(#glow)">${line(HORIZON + 4, '='.repeat(COLS), 'horizon')}</g>
<g>${floor()}</g>
<rect class="scanline" x="0" y="0" width="${W}" height="160" fill="url(#scan)"/>
</svg>`
