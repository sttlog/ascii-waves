// Vaporwave: air and water. A pastel sky, clouds drifting by, a calm sea
// that never stops rolling, steam rising off it and marble columns afloat.
import { art, cloud, glow, grad, H, rng, scrollRow, svg, text, timing, W } from '../ascii.ts'
import { makeColors } from '../make-colors.js'
import { chatStyle, cues, type Wave } from '../wave.ts'

const HZ = 560
const r = rng(11)

function clouds() {
  const spots: [number, number, number, number][] = [
    [100, 60, 34, 7], [880, 30, 46, 8], [520, 200, 28, 6], [1240, 150, 38, 7], [40, 320, 24, 5], [1360, 350, 26, 5],
  ]
  return spots
    .map(([x, y, w, h], i) => {
      const lines = cloud(r, w, h)
      return `<g class="skydrift" ${timing(170 + i * 31, r() * 170)}>${art(x, y, lines, 'cloud', 14)}</g>`
    })
    .join('')
}

function sea() {
  let css = ''
  let out = ''
  let y = HZ + 8
  let i = 0
  const units = ['-   ~    -  ', '~~  -~~   ~ ', '~^~  ~~^~   ']
  while (y < H + 30) {
    const t = (y - HZ) / (H - HZ)
    const unit = units[t < 0.3 ? 0 : t < 0.65 ? 1 : 2] ?? '~'
    const shift = Math.floor(r() * unit.length)
    const u = (unit + unit).slice(shift, shift + unit.length)
    const row = scrollRow(`sea${i}`, y, u, 10 + t * 16, 'wave', 16 - t * 9, i % 2 ? 1 : -1, 0.35 + t * 0.55)
    css += row.css
    out += row.svg
    y += 9 + t * 24
    i++
  }
  return { css, out }
}

function steam() {
  let out = ''
  for (let i = 0; i < 18; i++) {
    const x = 60 + r() * (W - 120)
    const base = HZ + 10 + r() * 160
    let col = ''
    const glyphs = ['(', ')', '(', ')', "'", '.']
    glyphs.forEach((g, k) => {
      col += text(x + Math.sin(k * 1.3 + i) * 7, base - k * 18, g, 'steam-glyph')
    })
    out += `<g class="steam" ${timing(9 + r() * 6, r() * 12)}>${col}</g>`
  }
  return out
}

const COLUMN = [
  ' ___________ ',
  '(___________)',
  '  | | | | |  ',
  '  | | | | |  ',
  '  | | | | |  ',
  '  | | | | |  ',
  '  | | | | |  ',
  ' _|_|_|_|_|_ ',
  '|___________|',
]

const columns = () =>
  [
    [400, HZ - 70, 0],
    [1080, HZ - 40, 3],
  ]
    .map(([x, y, d]) => `<g class="bob" ${timing(8, d ?? 0)}>${art(x ?? 0, y ?? 0, COLUMN, 'marble')}</g>`)
    .join('')

const s = sea()

const SCENE = svg(
  grad('sky', [[0, '#a796ff'], [0.45, '#dba6ff'], [0.8, '#ffb6da'], [1, '#ffd8c6']]) +
    grad('water', [[0, '#9af3e8'], [0.4, '#5ec8e2'], [1, '#4b78cf']]) +
    grad('haze', [[0, '#ffffff', 0], [0.5, '#ffffff', 0.5], [1, '#ffffff', 0]]) +
    glow('soft', 3) +
    `<filter id="drop" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="3" dy="3" stdDeviation="0" flood-color="#ff7ad9" flood-opacity="0.8"/></filter>`,
  `
.cloud { fill: #ffffff; font-weight: 700; opacity: 0.92; }
.wave { fill: #f2ffff; font-weight: 700; }
.steam { animation: steam 11s ease-out infinite; }
.steam-glyph { fill: #ffffff; opacity: 0.7; font-size: 18px; }
.marble { fill: #fffafd; font-weight: 700; }
.shimmer { fill: #ffffff; animation: pulse 5s ease-in-out infinite; }
@keyframes steam { 0% { transform: translateY(30px); opacity: 0; } 30% { opacity: 0.8; } 100% { transform: translateY(-240px); opacity: 0; } }
${s.css}`,
  `<rect width="${W}" height="${HZ}" fill="url(#sky)"/>
<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#water)"/>
<g>${clouds()}</g>
<rect y="${HZ - 60}" width="${W}" height="120" fill="url(#haze)"/>
${text(W / 2, HZ + 2, '- '.repeat(90), 'shimmer mid')}
<g filter="url(#drop)">${columns()}</g>
<g>${s.out}</g>
<g filter="url(#soft)">${steam()}</g>`,
)

const { theme, problems } = makeColors({
  label: 'Vaporwave',
  only: 'light',
  roles: { accent: '#c23a9e', danger: '#c62f4a', success: '#1f8a70', warning: '#a86a10', pro: '#5b4bd6' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#efe7fb',
        'surface-1': '#f5f0fd',
        'surface-2': '#fcfaff',
        'text-primary': '#2a1f3d',
        'text-secondary': '#4f4466',
        'text-muted': '#665b7e',
      },
    },
  },
})

export const vaporwave: Wave = {
  id: 'vaporwave',
  label: 'Vaporwave',
  blurb: 'Pastel sky, drifting clouds, steam rising off a calm sea.',
  mode: 'light',
  colors: theme,
  problems,
  glass: { blur: 10, tint: '#f5f0fd', opacity: 0.5 },
  scene: SCENE,
  style: chatStyle({
    text: '#2a1f3d',
    heading: '#b0308f',
    user: { bg: '#fff7fcf5', border: '#ff7ad9', shadow: '#7fe3e0', offset: 4 },
    bot: { bg: '#fbf9fff2', border: '#b9a6ff' },
    tool: { color: '#2a5a6e', bg: '#effcfcf2', border: '#7fd3d6' },
  }),
  sound: {
    ambience: {
      reverb: 0.85,
      layers: [
        { wave: 'sine', drone: true, notes: ['F3', 'A3', 'C4', 'E4'], gain: 0.12, tremolo: { hz: 0.1, depth: 0.35 }, filter: { type: 'lowpass', hz: 900, to: 1500 } },
        { wave: 'pink', drone: true, gain: 0.1, tremolo: { hz: 0.08, depth: 0.7 }, filter: { type: 'lowpass', hz: 700 } },
        { wave: 'bell', notes: ['C5', 'E5', 'G5', 'B5', 'D6'], scatter: 0.09, attack: 0.02, release: 3.2, gain: 0.08, filter: { type: 'lowpass', hz: 3000 } },
      ],
    },
    cues: cues(['F4', 'A4', 'C5', 'E5'], 'triangle'),
  },
}
