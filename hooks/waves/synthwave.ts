import { makeColors } from '../make-colors.js'
import { chatStyle, type Wave } from '../wave.ts'
import { SCENE } from './synthwave-scene.ts'

const { theme, problems } = makeColors({
  label: 'Synthwave',
  only: 'dark',
  roles: { accent: '#3a9bff', danger: '#ff4d6d', success: '#3ddc97', warning: '#ffb347', pro: '#ff4fd8' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0b0a1f',
        'surface-1': '#121030',
        'surface-2': '#161338',
        'surface-3': '#1a173f',
        'text-primary': '#eef1ff',
        'text-secondary': '#c3c8f0',
        'text-muted': '#9aa0d4',
      },
    },
  },
})

const PENTA = ['A4', 'C5', 'D5', 'E5', 'G5', 'A5'] as const

export const synthwave: Wave = {
  id: 'synthwave',
  label: 'Synthwave',
  blurb: 'Neon sunset over an endless grid.',
  mode: 'dark',
  colors: theme,
  problems,
  glass: { blur: 8, tint: '#0b0a1f', opacity: 0.45 },
  scene: SCENE,
  style: chatStyle({
    text: '#e8ecff',
    heading: '#7cc4ff',
    user: { bg: '#141238f5', border: '#3a9bff', shadow: '#3a9bff55' },
    bot: { bg: '#0d0c26f0', border: '#24317a' },
    tool: { color: '#8fd3ff', bg: '#0e0c2af2', border: '#1f4fa8' },
  }),
  sound: {
    ambience: {
      reverb: 0.55,
      layers: [
        { wave: 'saw', drone: true, notes: ['A1', 'E2', 'A2'], gain: 0.22, filter: { type: 'lowpass', hz: 320, to: 900 } },
        { wave: 'triangle', drone: true, notes: ['C4', 'E4'], gain: 0.07, tremolo: { hz: 0.15, depth: 0.5 }, filter: { type: 'lowpass', hz: 1400 } },
        { wave: 'pink', drone: true, gain: 0.04, filter: { type: 'lowpass', hz: 700 } },
        { wave: 'sine', notes: PENTA, scatter: 0.18, attack: 0.03, release: 2.2, gain: 0.1, pan: 0.3, filter: { type: 'lowpass', hz: 2400 } },
      ],
    },
    cues: {
      send: { layers: [{ wave: 'saw', notes: ['A3'], glide: 12, attack: 0.01, release: 0.25, gain: 0.25, filter: { type: 'lowpass', hz: 600, to: 2400 } }] },
      tool: { layers: [{ wave: 'sine', notes: ['E6'], release: 0.08, gain: 0.12 }] },
      done: { reverb: 0.4, layers: [{ wave: 'triangle', notes: ['A4', 'C5', 'E5', 'A5'], step: 0.09, release: 0.6, gain: 0.3 }] },
      ask: { layers: [{ wave: 'square', notes: ['E5', 'A5'], step: 0.12, release: 0.3, gain: 0.15, filter: { type: 'lowpass', hz: 1800 } }] },
      error: { layers: [{ wave: 'saw', notes: ['A3', 'Eb3'], step: 0.16, glide: -5, release: 0.5, gain: 0.22, filter: { type: 'lowpass', hz: 900 } }] },
      compact: { layers: [{ wave: 'white', attack: 0.3, release: 0.8, gain: 0.12, filter: { type: 'bandpass', hz: 400, to: 4000 } }] },
      click: { reverb: 0.5, layers: [{ wave: 'bell', notes: [...PENTA], release: 1.2, gain: 0.2 }] },
    },
  },
}
