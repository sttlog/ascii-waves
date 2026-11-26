// Chillwave: a breezy, hazy summer afternoon. Rolling hills, a windmill
// turning, tall grass bending as gusts cross it, seeds and birds on the wind.
import { art, cloud, COLS, f, glow, grad, H, pick, range, rng, svg, text, timing, W } from '../ascii.ts'
import { makeColors } from '../make-colors.js'
import { chatStyle, cues, type Wave } from '../wave.ts'

const HZ = 560
const r = rng(71)

function clouds() {
  const spots: [number, number, number, number][] = [
    [60, 70, 40, 5], [760, 40, 52, 6], [1260, 120, 36, 5], [420, 190, 30, 4], [1100, 260, 26, 4],
  ]
  return spots
    .map(([x, y, w, h], i) => `<g class="skydrift" ${timing(220 + i * 37, r() * 220)}>${art(x, y, cloud(r, w, h), 'cloud', 13)}</g>`)
    .join('')
}

function birds() {
  let out = ''
  for (let i = 0; i < 6; i++) {
    const x = 200 + r() * 1200
    const y = 120 + r() * 220
    out += `<g class="glide" ${timing(70 + r() * 40, r() * 100)}><g class="bob" ${timing(3 + r() * 2, r() * 3)}>${text(x, y, pick(r, ['v', 'V', 'v  v']), 'bird')}</g></g>`
  }
  return out
}

function hills() {
  const far: number[] = []
  const near: number[] = []
  for (let c = 0; c < COLS; c++) {
    far.push(Math.max(1, Math.floor(6 + 3 * Math.sin(c * 0.035 + 1) + 1.5 * Math.sin(c * 0.11))))
    near.push(Math.max(1, Math.floor(4 + 3 * Math.sin(c * 0.025 + 3.6) + 1 * Math.sin(c * 0.09 + 1))))
  }
  return (
    range({ heights: far, base: HZ + 10, lh: 14, mass: 'hill-far', ridge: 'ridge-far', body: 'grass-far', bodyChars: '.,' }) +
    range({ heights: near, base: HZ + 70, lh: 14, mass: 'hill-near', ridge: 'ridge-near', body: 'grass-near', bodyChars: "\",'" })
  )
}

const TOWER = ['    /\\', '   /  \\', '  /____\\', '  |    |', '  | [] |', '  |    |', '  |    |', ' /______\\']

function windmill() {
  const x = 1040
  const y = HZ - 30
  const hubX = x + 5 * 9.6
  const hubY = y + 4
  const blade = '|=|=|=|=|'
  const arms = [0, 90, 180, 270]
    .map(a => `<g transform="translate(${f(hubX)} ${f(hubY)}) rotate(${a})">${text(6, 5, blade, 'blade')}</g>`)
    .join('')
  return art(x, y + 10, TOWER, 'tower', 17) + `<g class="spin" ${timing(16, 0)}>${arms}</g>` + text(hubX - 4, hubY + 5, 'o', 'hub')
}

function grass() {
  let out = ''
  for (let i = 0; i < 110; i++) {
    const x = r() * W
    const depth = r()
    const base = 660 + depth * 260
    const fs = 13 + depth * 12
    const n = 3 + Math.floor(r() * 3)
    let blade = ''
    for (let k = 0; k < n; k++) blade += text(x, base - k * fs * 0.9, k === n - 1 ? pick(r, [',', '/', '|', '*', '\\']) : pick(r, ['|', '|', '/', '\\']), 'blade-g', `style="font-size:${f(fs)}px"`)
    if (r() < 0.12) blade += text(x, base - n * fs * 0.9, '*', pick(r, ['flower-a', 'flower-b']), `style="font-size:${f(fs)}px"`)
    // gusts roll across: the phase follows x, so the bend travels left to right
    out += `<g class="sway gust" ${timing(5, 5 - (x / W) * 5)}>${blade}</g>`
  }
  return out
}

function seeds() {
  let out = ''
  for (let i = 0; i < 55; i++) {
    out += `<g class="waft" ${timing(18 + r() * 14, r() * 30)}><g class="bob" ${timing(3 + r() * 3, r() * 3)}>${text(r() * W, 150 + r() * 650, pick(r, ['*', '+', '.', "'", '*']), 'seed')}</g></g>`
  }
  return out
}

function wind() {
  let out = ''
  for (let i = 0; i < 12; i++) {
    out += `<g class="waft" ${timing(8 + r() * 5, r() * 12)}>${text(r() * W, 120 + r() * 700, pick(r, ['~~~---~~', '-~~--', '~--~~~--', '~~--']), 'gust-line')}</g>`
  }
  return out
}

function meadow() {
  let out = ''
  for (let y = HZ + 90; y < H + 10; y += 16) {
    let s = ''
    for (let c = 0; c < 180; c++) s += pick(r, [' ', ' ', ' ', ',', "'", '"', '.'])
    out += text(0, y, s, 'meadow')
  }
  return out
}

const SCENE = svg(
  grad('sky', [[0, '#86c6ee'], [0.55, '#bfe2f2'], [1, '#f6e6c6']]) +
    grad('field', [[0, '#a9d27f'], [1, '#78ad58']]) +
    `<radialGradient id="haze"><stop offset="0" stop-color="#ffffff" stop-opacity="0.75"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>` +
    glow('soft', 2),
  `
.cloud { fill: #ffffff; font-weight: 700; }
.bird { fill: #3d4a5c; font-weight: 700; }
.glide { animation: glide 90s linear infinite; }
.hill-far { fill: #b9d9a2; }
.ridge-far { fill: #6f9e62; }
.grass-far { fill: #7fae70; }
.hill-near { fill: #a3cd83; }
.ridge-near { fill: #4f8a45; font-weight: 700; }
.grass-near { fill: #5d9650; }
.tower { fill: #7a4b33; font-weight: 700; }
.blade { fill: #fff6e6; stroke: #7a4b33; stroke-width: 0.7; paint-order: stroke; font-weight: 700; }
.hub { fill: #5a3826; font-weight: 700; }
.blade-g { fill: #3f7d36; font-weight: 700; }
.flower-a { fill: #ff7ab8; }
.flower-b { fill: #ffd23f; }
.gust { animation-name: gust; }
.seed { fill: #fffbe6; font-weight: 700; }
.gust-line { fill: #ffffff; opacity: 0.6; }
.meadow { fill: #4e8a3f; opacity: 0.5; }
@keyframes glide { from { transform: translateX(-1900px); } to { transform: translateX(1900px); } }
@keyframes gust { 0%, 100% { transform: rotate(-1deg); } 40% { transform: rotate(9deg); } 60% { transform: rotate(6deg); } }
`,
  `<rect width="${W}" height="${HZ}" fill="url(#sky)"/>
<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#field)"/>
<circle cx="1350" cy="90" r="320" fill="url(#haze)"/>
<g>${clouds()}</g>
<g>${birds()}</g>
<g>${hills()}</g>
<g>${windmill()}</g>
<g>${meadow()}</g>
<g>${grass()}</g>
<g filter="url(#soft)">${wind()}</g>
<g>${seeds()}</g>`,
)

const { theme, problems } = makeColors({
  label: 'Chillwave',
  only: 'light',
  roles: { accent: '#2b7fb8', danger: '#b8402f', success: '#3f8a3a', warning: '#a8690f', pro: '#8a4fae' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#f3e8d5',
        'surface-1': '#f8efe1',
        'surface-2': '#fdf8ef',
        'text-primary': '#2b2417',
        'text-secondary': '#54493a',
        'text-muted': '#6a5e4c',
      },
    },
  },
})

export const chillwave: Wave = {
  id: 'chillwave',
  label: 'Chillwave',
  blurb: 'A breezy summer afternoon: windmill, tall grass, seeds on the wind.',
  mode: 'light',
  colors: theme,
  problems,
  glass: { blur: 10, tint: '#f8efe1', opacity: 0.5 },
  scene: SCENE,
  style: chatStyle({
    text: '#2b2417',
    heading: '#2b7fb8',
    user: { bg: '#fffaf0f5', border: '#e0a458', shadow: '#9fd3c7', offset: 3 },
    bot: { bg: '#fdf9f2f2', border: '#d9c7a6' },
    tool: { color: '#2f5f7a', bg: '#f3f8f5f2', border: '#a9cbb9' },
    radius: 6,
  }),
  sound: {
    ambience: {
      reverb: 0.4,
      layers: [
        { wave: 'sine', drone: true, notes: ['D3', 'A3', 'F#4'], gain: 0.11, tremolo: { hz: 0.2, depth: 0.3 }, filter: { type: 'lowpass', hz: 900 } },
        { wave: 'pink', drone: true, gain: 0.07, filter: { type: 'lowpass', hz: 500, to: 1600 } },
        { wave: 'crackle', drone: true, gain: 0.03 },
        { wave: 'triangle', notes: ['D5', 'E5', 'F#5', 'A5', 'B5'], scatter: 0.15, attack: 0.02, release: 1.5, gain: 0.08, filter: { type: 'lowpass', hz: 2600 } },
      ],
    },
    cues: cues(['D4', 'F#4', 'A4', 'D5'], 'triangle'),
  },
}
