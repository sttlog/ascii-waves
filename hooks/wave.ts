import type { ThemeBackdropGlass, ThemeColor, ThemeSetArgs, ThemeSound, ThemeStyle } from 'claude-code'

/** One theme: its palette, how messages look, its sound and its scene. */
export type Wave = {
  id: string
  label: string
  blurb: string
  mode: 'light' | 'dark'
  colors: NonNullable<ThemeSetArgs['colors']>
  problems: readonly string[]
  glass: ThemeBackdropGlass
  style: ThemeStyle
  sound: ThemeSound
  scene: string
}

type Tone = 'sine' | 'triangle' | 'square' | 'saw' | 'bell'
type Cues = NonNullable<ThemeSound['cues']>

/** The app's sound cues, played on a theme's own scale and instrument. */
export function cues(scale: readonly [string, string, string, string], wave: Tone, chime: Tone = 'bell'): Cues {
  const [a, b, c, d] = scale
  return {
    send: { layers: [{ wave, notes: [a], glide: 12, attack: 0.01, release: 0.25, gain: 0.22, filter: { type: 'lowpass', hz: 700, to: 2400 } }] },
    tool: { layers: [{ wave: 'sine', notes: [d], release: 0.08, gain: 0.1 }] },
    done: { reverb: 0.4, layers: [{ wave, notes: [a, b, c, d], step: 0.09, release: 0.6, gain: 0.25, filter: { type: 'lowpass', hz: 2200 } }] },
    ask: { layers: [{ wave: 'triangle', notes: [c, d], step: 0.12, release: 0.35, gain: 0.18 }] },
    error: { layers: [{ wave: 'saw', notes: [b, a], step: 0.16, glide: -5, release: 0.5, gain: 0.2, filter: { type: 'lowpass', hz: 900 } }] },
    compact: { layers: [{ wave: 'white', attack: 0.3, release: 0.8, gain: 0.1, filter: { type: 'bandpass', hz: 400, to: 4000 } }] },
    click: { reverb: 0.5, layers: [{ wave: chime, notes: [a, b, c, d], release: 1.2, gain: 0.18 }] },
  }
}

/** Monospace messages in square boxes, colored per theme. */
export function chatStyle(o: {
  text: ThemeColor
  heading: ThemeColor
  user: { bg: ThemeColor; border: ThemeColor; shadow?: ThemeColor; offset?: number }
  bot: { bg: ThemeColor; border: ThemeColor }
  tool: { color: ThemeColor; bg: ThemeColor; border: ThemeColor }
  radius?: number
}): ThemeStyle {
  const radius = o.radius ?? 0
  const box = { radius, padding: 14, color: o.text, borderWidth: 1 } as const
  const off = o.user.offset ?? 0
  return {
    Text: { fontFamily: ['mono'], fontSize: 14, lineHeight: 22 },
    Heading: { fontFamily: ['mono'], color: o.heading, letterSpacing: 1 },
    UserMessage: {
      ...box,
      backgroundColor: o.user.bg,
      borderColor: o.user.border,
      ...(o.user.shadow ? { shadow: { x: off, y: off, blur: off ? 0 : 14, color: o.user.shadow } } : {}),
    },
    AssistantMessage: { ...box, backgroundColor: o.bot.bg, borderColor: o.bot.border },
    ToolUse: { color: o.tool.color, fontFamily: ['mono'], backgroundColor: o.tool.bg, borderColor: o.tool.border, borderWidth: 1, radius, paddingX: 8 },
  }
}
