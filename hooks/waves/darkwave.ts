// Darkwave: a city at night in the rain. Towers of [] windows, neon signs,
// rain slanting down and red light smeared across the wet street.
import { art, CW, f, glow, grad, H, pick, rng, scrollRow, svg, text, timing, W } from '../ascii.ts'
import { makeColors } from '../make-colors.js'
import { chatStyle, cues, type Wave } from '../wave.ts'

const HZ = 730
const LH = 14
const r = rng(23)

function tower(x: number, w: number, h: number, front: boolean) {
  const top = HZ - h * LH
  let body = ''
  let lit = ''
  let flick = ''
  const roof = ' ' + '_'.repeat(w - 2) + ' '
  body += text(x, top, roof, front ? 'wall' : 'wall-far')
  for (let k = 1; k < h; k++) {
    const y = top + k * LH
    let line = '|'
    let on = ' '
    let blink = ' '
    for (let j = 0; j < w - 2; j++) {
      const slot = j % 3
      const isWindow = k % 2 === 1 && slot !== 0 && j < w - 3
      line += isWindow ? (slot === 1 ? '[' : ']') : ' '
      if (isWindow && slot === 1) {
        const roll = r()
        const state = roll < (front ? 0.22 : 0.12) ? 'on' : roll < (front ? 0.27 : 0.14) ? 'blink' : 'off'
        on += state === 'on' ? '[]' : '  '
        blink += state === 'blink' ? '[]' : '  '
      } else if (!(isWindow && slot === 2)) {
        on += ' '
        blink += ' '
      }
    }
    line += '|'
    body += text(x, y, line, front ? 'wall' : 'wall-far')
    if (on.trim()) lit += text(x, y, on, front ? 'lit' : 'lit-far')
    if (blink.trim()) flick += `<g class="pulse" ${timing(6 + r() * 8, r() * 8)}>${text(x, y, blink, 'lit')}</g>`
  }
  let antenna = ''
  if (r() < 0.45) {
    const ax = x + Math.floor(w / 2) * CW
    antenna = text(ax, top - LH, '|', 'wall') + text(ax, top - 2 * LH, '|', 'wall') + `<g class="beacon">${text(ax - 1, top - 3 * LH + 2, '*', 'beacon-dot')}</g>`
  }
  const block = `<rect x="${f(x)}" y="${f(top - 8)}" width="${f(w * CW)}" height="${f(h * LH + 8)}" class="${front ? 'mass' : 'mass-far'}"/>`
  return block + body + lit + flick + antenna
}

function skyline() {
  let far = ''
  let near = ''
  for (let x = -60; x < W + 60; x += 70 + r() * 90) far += tower(x, 7 + Math.floor(r() * 7), 18 + Math.floor(r() * 18), false)
  const fronts: [number, number][] = []
  for (let x = -40; x < W + 40; x += 110 + r() * 120) {
    const w = 9 + Math.floor(r() * 8)
    const h = 8 + Math.floor(r() * 16)
    near += tower(x, w, h, true)
    fronts.push([x, h])
  }
  const signs = [
    { at: fronts[2], lines: ['+-------+', '| HOTEL |', '+-------+'] },
    { at: fronts[Math.max(0, fronts.length - 3)], lines: ['+-+', '|B|', '|A|', '|R|', '+-+'] },
  ]
  const neon = signs
    .map(s => {
      const [x, h] = s.at ?? [0, 10]
      return `<g class="pulse" ${timing(5, r() * 5)}>${art(x + 2 * CW, HZ - h * LH + 3 * LH, s.lines, 'neon', LH)}</g>`
    })
    .join('')
  return { far, near, neon }
}

function rain() {
  let out = ''
  for (let i = 0; i < 170; i++) {
    const big = r() < 0.15
    const g = pick(r, ['/', '/', '/', "'", ':'])
    out += `<g class="rain" ${timing(big ? 0.9 + r() * 0.3 : 1.3 + r() * 0.6, r() * 2)}>${text(-100 + r() * (W + 300), -30, g, big ? 'drop big' : 'drop')}</g>`
  }
  return out
}

function splashes() {
  let out = ''
  for (let i = 0; i < 40; i++) {
    out += `<g class="splash" ${timing(1.3 + r() * 0.8, r() * 2)}>${text(r() * W, HZ + 30 + r() * (H - HZ - 30), pick(r, ['.', 'o', '.']), 'splash-dot')}</g>`
  }
  return out
}

function street() {
  let css = ''
  let out = ''
  let i = 0
  for (let y = HZ + 18; y < H + 20; y += 16 + (y - HZ) * 0.05) {
    const unit = Array.from({ length: 24 }, () => pick(r, [' ', ' ', ' ', '-', '~', '='])).join('')
    const row = scrollRow(`st${i}`, y, unit, 13 + (y - HZ) * 0.04, i % 3 ? 'smear-red' : 'smear-amber', 18 + r() * 10, i % 2 ? 1 : -1, 0.25 + ((y - HZ) / (H - HZ)) * 0.35)
    css += row.css
    out += row.svg
    i++
  }
  return { css, out }
}

function moon() {
  let out = ''
  const cx = 250
  const cy = 170
  const R = 62
  for (let y = cy - R + 6; y < cy + R; y += 12) {
    const half = Math.sqrt(Math.max(0, R * R - (y - cy) ** 2))
    const n = Math.round((2 * half) / CW)
    out += text(cx, y, (y < cy ? ':' : '.').repeat(n), 'moon mid')
  }
  return out
}

const city = skyline()
const st = street()

const SCENE = svg(
  grad('sky', [[0, '#030203'], [0.55, '#12060a'], [1, '#40101a']]) +
    grad('road', [[0, '#14070a'], [1, '#050203']]) +
    grad('fog', [[0, '#5a1420', 0], [0.5, '#5a1420', 0.35], [1, '#5a1420', 0]]) +
    glow('neonglow', 4) +
    glow('litglow', 2),
  `
.moon { fill: #8a1f2c; opacity: 0.55; }
.mass { fill: #0a0507; }
.mass-far { fill: #120709; }
.wall { fill: #6a2a35; }
.wall-far { fill: #3a161d; }
.lit { fill: #ffb24a; }
.lit-far { fill: #b8434f; opacity: 0.7; }
.neon { fill: #ff2e63; font-weight: 700; }
.beacon { animation: pulse 3s ease-in-out infinite; }
.beacon-dot { fill: #ff3b3b; }
.drop { fill: #c79aa3; opacity: 0.3; }
.big { font-size: 22px; opacity: 0.4; }
.rain { animation: rain 1.5s linear infinite; }
.splash { opacity: 0; animation: splash 1.6s ease-out infinite; }
.splash-dot { fill: #d8a0aa; }
.smear-red { fill: #ff3355; }
.smear-amber { fill: #ffaa44; }
.fog { animation: swing 30s ease-in-out infinite alternate; }
@keyframes rain { from { transform: translate(0, 0); } to { transform: translate(-150px, 960px); } }
@keyframes splash { 0% { opacity: 0; } 15% { opacity: 0.6; } 100% { opacity: 0; } }
${st.css}`,
  `<rect width="${W}" height="${HZ}" fill="url(#sky)"/>
<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#road)"/>
<g filter="url(#litglow)">${moon()}</g>
<g>${city.far}</g>
<rect class="fog" x="-100" y="${HZ - 240}" width="${W + 200}" height="260" fill="url(#fog)"/>
<g filter="url(#litglow)">${city.near}</g>
<g filter="url(#neonglow)">${city.neon}</g>
<g>${st.out}</g>
<g>${splashes()}</g>
<g>${rain()}</g>`,
)

const { theme, problems } = makeColors({
  label: 'Darkwave',
  only: 'dark',
  roles: { accent: '#d63a6e', danger: '#ff4a3d', success: '#4fb88a', warning: '#e3a03a', pro: '#a084ff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0d0a0c',
        'surface-1': '#151013',
        'surface-2': '#1a1418',
        'surface-3': '#1e171b',
        'text-primary': '#f2e9ec',
        'text-secondary': '#cdbcc3',
        'text-muted': '#a6949c',
      },
    },
  },
})

export const darkwave: Wave = {
  id: 'darkwave',
  label: 'Darkwave',
  blurb: 'Rain on a red-lit city at night.',
  mode: 'dark',
  colors: theme,
  problems,
  glass: { blur: 6, tint: '#0d0a0c', opacity: 0.5 },
  scene: SCENE,
  style: chatStyle({
    text: '#f2e9ec',
    heading: '#ff5c8a',
    user: { bg: '#1a0d12f5', border: '#ff2e63', shadow: '#ff2e6355' },
    bot: { bg: '#110c0ef2', border: '#4a1e28' },
    tool: { color: '#ffb2a6', bg: '#140c0ff2', border: '#6a2a35' },
  }),
  sound: {
    ambience: {
      reverb: 0.7,
      layers: [
        { wave: 'saw', drone: true, notes: ['D1', 'A1', 'D2'], gain: 0.22, filter: { type: 'lowpass', hz: 180, to: 480 } },
        { wave: 'pink', drone: true, gain: 0.16, filter: { type: 'highpass', hz: 900 } },
        { wave: 'crackle', drone: true, gain: 0.06 },
        { wave: 'square', notes: ['D4', 'F4', 'A4', 'C5'], scatter: 0.07, attack: 0.05, release: 1.8, gain: 0.07, filter: { type: 'lowpass', hz: 800 } },
      ],
    },
    cues: cues(['D4', 'F4', 'A4', 'C5'], 'square', 'triangle'),
  },
}
