// Dreamwave: cold air on a winter night. Aurora curtains in characters,
// a crescent moon, snowy peaks, a frozen lake and snow drifting down.
import { blank, COLS, CW, glow, grad, H, pick, range, rng, row, scrollRow, stars, svg, text, timing, W } from '../ascii.ts'
import { makeColors } from '../make-colors.js'
import { chatStyle, cues, type Wave } from '../wave.ts'

const HZ = 700
const r = rng(53)

function aurora() {
  let out = ''
  for (let b = 0; b < 3; b++) {
    let rows = ''
    for (let y = 60; y <= 460; y += 14) {
      const cells = blank()
      for (let c = 0; c < COLS; c++) {
        if ((c + b) % 3 !== 0) continue
        const top = 150 + 90 * Math.sin(c * 0.028 + b * 1.1) + 40 * Math.sin(c * 0.085 + b * 2.3)
        const len = 70 + 150 * (0.5 + 0.5 * Math.sin(c * 0.05 + b * 1.7)) ** 2
        const t = (y - top) / len
        if (t < 0 || t > 1) continue
        cells[c] = t < 0.15 ? '|' : t < 0.5 ? '!' : t < 0.8 ? ':' : '.'
      }
      rows += row(y, cells.join(''), 'aurora')
    }
    out += `<g class="curtain c${b}">${rows}</g>`
  }
  return out
}

function moon() {
  let out = ''
  const cx = 1120
  const cy = 150
  const R = 64
  for (let y = cy - R + 6; y < cy + R; y += 12) {
    let s = ''
    for (let x = cx - R; x < cx + R; x += CW) {
      const inA = (x - cx) ** 2 + (y - cy) ** 2 <= R * R
      const inB = (x - cx - 30) ** 2 + (y - cy + 14) ** 2 <= (R * 0.9) ** 2
      s += inA && !inB ? '#' : ' '
    }
    out += text(cx - R, y, s, 'moon')
  }
  return out
}

function peaks() {
  const heights: number[] = []
  for (let c = 0; c < COLS; c++) {
    const h = 9 + 6 * Math.sin(c * 0.06 + 0.5) + 4 * Math.sin(c * 0.17 + 2) + 2 * Math.sin(c * 0.41)
    heights.push(Math.max(1, Math.floor(h)))
  }
  return range({ heights, base: HZ, lh: 14, mass: 'mass', ridge: 'ridge', body: 'rock', bodyChars: '.:', cap: 'snowcap', capDepth: 2 })
}

function lake() {
  let css = ''
  let out = ''
  let i = 0
  for (let y = HZ + 20; y < H + 10; y += 18 + i * 2) {
    const unit = Array.from({ length: 20 }, () => pick(r, [' ', ' ', ' ', '-', '~', '.'])).join('')
    const sr = scrollRow(`lk${i}`, y, unit, 13 + i, i % 2 ? 'glint-green' : 'glint-violet', 30 + r() * 15, i % 2 ? 1 : -1, 0.45 - i * 0.03)
    css += sr.css
    out += sr.svg
    i++
  }
  return { css, out }
}

function snow() {
  let out = ''
  for (let i = 0; i < 120; i++) {
    const near = r() < 0.2
    out += `<g class="fall" ${timing(near ? 16 + r() * 6 : 24 + r() * 12, r() * 36)}><g class="swing" ${timing(4 + r() * 4, r() * 4)}>${text(r() * W, r() * H, pick(r, ['*', '.', '+', '.', '*']), near ? 'flake near' : 'flake')}</g></g>`
  }
  return out
}

const lk = lake()

const SCENE = svg(
  grad('sky', [[0, '#04030f'], [0.5, '#0d0a2a'], [0.85, '#24174d'], [1, '#3b2366']]) +
    grad('ice', [[0, '#1a1340'], [1, '#06041a']]) +
    grad('aur', [[0, '#d08bff', 0.9], [0.45, '#7cf2c8', 0.95], [1, '#5cf2b0', 0.1]], 'gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="460"') +
    `<radialGradient id="moonhalo"><stop offset="0" stop-color="#fff3cf" stop-opacity="0.25"/><stop offset="1" stop-color="#fff3cf" stop-opacity="0"/></radialGradient>` +
    glow('aglow', 4) +
    glow('mglow', 5),
  `
.star { fill: #dcd6ff; }
.s2 { fill: #ffffff; }
.s3 { fill: #a99cff; }
.aurora { fill: url(#aur); font-weight: 700; }
.curtain { animation: curtain 18s ease-in-out infinite alternate; }
.c1 { animation-duration: 23s; animation-delay: -7s; }
.c2 { animation-duration: 29s; animation-delay: -15s; }
.moon { fill: #fff3cf; font-weight: 700; }
.mass { fill: #0a0820; }
.ridge { fill: #eef0ff; font-weight: 700; }
.snowcap { fill: #dfe4ff; opacity: 0.8; }
.rock { fill: #3a3270; }
.glint-green { fill: #7cf2c8; }
.glint-violet { fill: #b28bff; }
.flake { fill: #f4f2ff; opacity: 0.6; }
.near { font-size: 22px; opacity: 0.85; }
@keyframes curtain { from { transform: translateX(-36px); opacity: 0.45; } to { transform: translateX(36px); opacity: 0.95; } }
${lk.css}`,
  `<rect width="${W}" height="${HZ}" fill="url(#sky)"/>
<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#ice)"/>
<g>${stars(r, 120, 16, HZ - 180)}</g>
<circle cx="1120" cy="150" r="170" fill="url(#moonhalo)"/>
<g filter="url(#mglow)">${moon()}</g>
<g filter="url(#aglow)">${aurora()}</g>
<g>${peaks()}</g>
<g>${lk.out}</g>
<g>${snow()}</g>`,
)

const { theme, problems } = makeColors({
  label: 'Dreamwave',
  only: 'dark',
  roles: { accent: '#9a86ff', danger: '#ff5d7a', success: '#5cf2b0', warning: '#ffcf6b', pro: '#ff8adf' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0c0a1c',
        'surface-1': '#13102a',
        'surface-2': '#171431',
        'surface-3': '#1b1737',
        'text-primary': '#efeaff',
        'text-secondary': '#c8c0ea',
        'text-muted': '#a098c9',
      },
    },
  },
})

export const dreamwave: Wave = {
  id: 'dreamwave',
  label: 'Dreamwave',
  blurb: 'Aurora and falling snow over frozen peaks.',
  mode: 'dark',
  colors: theme,
  problems,
  glass: { blur: 10, tint: '#0c0a1c', opacity: 0.45 },
  scene: SCENE,
  style: chatStyle({
    text: '#efeaff',
    heading: '#7cf2c8',
    user: { bg: '#16123af5', border: '#9a86ff', shadow: '#7cf2c855' },
    bot: { bg: '#0e0c22f2', border: '#2c2560' },
    tool: { color: '#b8f7e0', bg: '#0f0d26f2', border: '#3b3480' },
    radius: 4,
  }),
  sound: {
    ambience: {
      reverb: 1,
      layers: [
        { wave: 'triangle', drone: true, notes: ['E3', 'B3', 'F#4'], gain: 0.1, tremolo: { hz: 0.07, depth: 0.5 }, filter: { type: 'lowpass', hz: 1000 } },
        { wave: 'white', drone: true, gain: 0.035, filter: { type: 'bandpass', hz: 600, to: 1600 } },
        { wave: 'bell', notes: ['E5', 'F#5', 'B5', 'D6', 'E6'], scatter: 0.12, release: 3.5, gain: 0.07 },
      ],
    },
    cues: cues(['E4', 'B4', 'D5', 'F#5'], 'triangle'),
  },
}
