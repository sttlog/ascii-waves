// Seapunk: underwater in neon. Light shafts from the surface, kelp swaying,
// ASCII fish crossing, bubbles rising and jellyfish drifting.
import { art, f, glow, grad, H, pick, rng, scrollRow, svg, text, timing, W } from '../ascii.ts'
import { makeColors } from '../make-colors.js'
import { chatStyle, cues, type Wave } from '../wave.ts'

const FLOOR = 820
const r = rng(37)

function surface() {
  let css = ''
  let out = ''
  ;[18, 38, 56].forEach((y, i) => {
    const row = scrollRow(`sf${i}`, y, i === 1 ? '~-~~  -~  ' : '~~  ~-  ~ ', 17 - i * 2, 'ripple', 9 + i * 4, i % 2 ? 1 : -1, 0.7 - i * 0.18)
    css += row.css
    out += row.svg
  })
  return { css, out }
}

function rays() {
  return [180, 470, 760, 1050, 1330]
    .map((x, i) => {
      const w = 40 + r() * 50
      const pts = `${f(x - w)},0 ${f(x + w)},0 ${f(x + 220)},${H} ${f(x + 40)},${H}`
      return `<g class="ray" ${timing(14 + i * 3, r() * 10)}><polygon points="${pts}" fill="url(#beam)"/></g>`
    })
    .join('')
}

function kelp() {
  let out = ''
  const xs = [70, 210, 330, 560, 990, 1120, 1290, 1420, 1530]
  xs.forEach((x, i) => {
    const n = 14 + Math.floor(r() * 16)
    const back = i % 3 === 1
    let strand = ''
    for (let k = 0; k < n; k++) {
      const y = FLOOR + 30 - k * 16
      strand += text(x + Math.sin(k * 0.7 + i) * 6, y, k % 2 ? ')' : '(', back ? 'kelp-back' : 'kelp')
      if (k % 4 === 2) strand += text(x + 12 + Math.sin(k * 0.7 + i) * 6, y, '>', back ? 'kelp-back' : 'kelp')
    }
    out += `<g class="sway" ${timing(7 + r() * 5, r() * 6)}>${strand}</g>`
  })
  return out
}

function floor() {
  let out = ''
  for (let y = FLOOR + 14; y < H + 10; y += 14) {
    let s = ''
    for (let c = 0; c < 180; c++) s += pick(r, [' ', ' ', '.', ',', ':', ' ', '.', '`'])
    out += text(0, y, s, 'sand')
  }
  const coral = ['\\|/', ' Y ', '\\|/ ', 'YyY']
  ;[[420, FLOOR - 4], [760, FLOOR + 10], [1220, FLOOR - 2], [1480, FLOOR + 14]].forEach(([x, y]) => {
    out += art(x ?? 0, (y ?? 0) - 30, coral.slice(Math.floor(r() * 2), 3), 'coral', 15)
  })
  out += art(620, FLOOR + 12, ['(@@@)', '(@@@@@)'], 'rock', 14) + art(1320, FLOOR + 20, ['(@@)'], 'rock', 14)
  return out
}

function fish() {
  let out = ''
  const kinds = [
    { right: '><(((o>', left: '<o)))><' },
    { right: '><>', left: '<><' },
    { right: '>=<(((*>', left: '<*)))>=<' },
  ]
  const colors = ['fish-pink', 'fish-violet', 'fish-sky', 'fish-gold']
  for (let i = 0; i < 9; i++) {
    const k = pick(r, kinds)
    const goRight = r() < 0.5
    const y = 140 + r() * 600
    const x = 100 + r() * (W - 200)
    const body = text(x, y, goRight ? k.right : k.left, pick(r, colors))
    out += `<g class="${goRight ? 'swim-r' : 'swim-l'}" ${timing(45 + r() * 50, r() * 90)}><g class="bob" ${timing(2.5 + r() * 2, r() * 3)}>${body}</g></g>`
  }
  // a small school, swimming together
  let school = ''
  for (let j = 0; j < 7; j++) school += text(300 + (j % 4) * 26 + (j > 3 ? 13 : 0), 300 + (j > 3 ? 18 : 0) + (j % 2) * 6, '><>', 'fish-sky')
  out += `<g class="swim-r" ${timing(70, 20)}><g class="bob" ${timing(3, 1)}>${school}</g></g>`
  return out
}

function bubbles() {
  let out = ''
  for (let i = 0; i < 70; i++) {
    const x = r() * W
    const y = 100 + r() * (H - 120)
    out += `<g class="rise" ${timing(10 + r() * 10, r() * 20)}><g class="swing" ${timing(2 + r() * 2, r() * 2)}>${text(x, y, pick(r, ['o', 'o', 'O', '.', '.', '0']), 'bubble')}</g></g>`
  }
  return out
}

const JELLY = ['  .-"""-.', ' /       \\', ' \\_______/', '  ( ( ( (', '   ) ) ) )', '  ( ( ( (', '   ) ) )']

const jellies = () =>
  [
    [1180, 210, 0],
    [380, 430, 4],
  ]
    .map(([x, y, d]) => `<g class="drift-up" ${timing(12, d ?? 0)}>${art(x ?? 0, y ?? 0, JELLY, 'jelly', 16)}</g>`)
    .join('')

const sf = surface()

const SCENE = svg(
  grad('sea', [[0, '#0f8592'], [0.3, '#0a5a6a'], [0.7, '#053448'], [1, '#021a28']]) +
    grad('beam', [[0, '#c8fbff', 0.16], [0.7, '#c8fbff', 0.04], [1, '#c8fbff', 0]]) +
    glow('neon', 3),
  `
.ripple { fill: #b8fbff; font-weight: 700; }
.ray { transform-box: fill-box; transform-origin: 50% 0%; animation: raysway 16s ease-in-out infinite alternate; }
.kelp { fill: #2fd38a; font-weight: 700; font-size: 18px; }
.kelp-back { fill: #187055; font-size: 16px; }
.sand { fill: #c9b37a; opacity: 0.45; }
.coral { fill: #ff6ad5; font-weight: 700; }
.rock { fill: #4a6b78; }
.bubble { fill: #d6fcff; opacity: 0.65; }
.jelly { fill: #ff8ad8; font-weight: 700; }
.fish-pink { fill: #ff6ad5; font-weight: 700; }
.fish-violet { fill: #c48bff; font-weight: 700; }
.fish-sky { fill: #94e6ff; font-weight: 700; }
.fish-gold { fill: #ffe66d; font-weight: 700; }
.swim-r { animation: swimr 60s linear infinite; }
.swim-l { animation: swiml 60s linear infinite; }
.drift-up { animation: driftup 12s ease-in-out infinite alternate; }
@keyframes raysway { from { transform: rotate(-2.5deg); opacity: 0.7; } to { transform: rotate(2.5deg); opacity: 1; } }
@keyframes swimr { from { transform: translateX(-2000px); } to { transform: translateX(2000px); } }
@keyframes swiml { from { transform: translateX(2000px); } to { transform: translateX(-2000px); } }
@keyframes driftup { from { transform: translateY(30px); } to { transform: translateY(-40px); } }
${sf.css}`,
  `<rect width="${W}" height="${H}" fill="url(#sea)"/>
<g>${rays()}</g>
<g>${sf.out}</g>
<g>${kelp()}</g>
<g>${floor()}</g>
<g filter="url(#neon)">${jellies()}</g>
<g>${fish()}</g>
<g>${bubbles()}</g>`,
)

const { theme, problems } = makeColors({
  label: 'Seapunk',
  only: 'dark',
  roles: { accent: '#1fd1c1', danger: '#ff5c7a', success: '#5be08a', warning: '#ffc857', pro: '#c070ff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#04161c',
        'surface-1': '#071e26',
        'surface-2': '#09242d',
        'surface-3': '#0b2832',
        'text-primary': '#e6fbff',
        'text-secondary': '#b3dde6',
        'text-muted': '#88b8c3',
      },
    },
  },
})

export const seapunk: Wave = {
  id: 'seapunk',
  label: 'Seapunk',
  blurb: 'Under the sea in neon: kelp, fish, bubbles, jellyfish.',
  mode: 'dark',
  colors: theme,
  problems,
  glass: { blur: 8, tint: '#04161c', opacity: 0.45 },
  scene: SCENE,
  style: chatStyle({
    text: '#e6fbff',
    heading: '#5ff3e3',
    user: { bg: '#082830f5', border: '#1fd1c1', shadow: '#1fd1c155' },
    bot: { bg: '#05181ef2', border: '#1b4a55' },
    tool: { color: '#ff9ae2', bg: '#061c22f2', border: '#7a3f8f' },
    radius: 6,
  }),
  sound: {
    ambience: {
      reverb: 0.9,
      layers: [
        { wave: 'brown', drone: true, gain: 0.28, tremolo: { hz: 0.1, depth: 0.4 }, filter: { type: 'lowpass', hz: 320 } },
        { wave: 'sine', drone: true, notes: ['G2', 'D3', 'B3'], gain: 0.1, filter: { type: 'lowpass', hz: 600, to: 1100 } },
        { wave: 'sine', notes: ['C6', 'E6', 'G6', 'A6'], scatter: 0.6, glide: 10, attack: 0.005, release: 0.12, gain: 0.06 },
        { wave: 'bell', notes: ['G4', 'B4', 'D5', 'F#5'], scatter: 0.07, release: 3, gain: 0.07, filter: { type: 'lowpass', hz: 2200 } },
      ],
    },
    cues: cues(['G4', 'B4', 'D5', 'F#5'], 'sine'),
  },
}
