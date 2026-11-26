import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import type { Wave } from './wave.ts'
import { WAVES } from './waves/index.ts'

const KEY = 'wave'
const fallback = WAVES[0] as Wave

const find = (id: unknown) => WAVES.find(w => w.id === id)

async function current($: EngineInterface): Promise<Wave> {
  return find(await $.store.get(KEY)) ?? fallback
}

/** Sets a wave, dropping sound and then style if this build refuses them. */
async function apply($: EngineInterface, w: Wave) {
  const unpainted = w.problems.find(l => l.startsWith("Desktop won't paint"))
  if (unpainted !== undefined) $.ui.toast(`${w.label}: ${unpainted}`)

  const base: ThemeSetArgs = {
    colors: w.colors,
    overrideColorScheme: w.mode,
    backdrop: { scene: w.id, glass: w.glass },
  }
  const tries: ThemeSetArgs[] = [{ ...base, style: w.style, sound: w.sound }, { ...base, style: w.style }, base]
  for (const [i, args] of tries.entries()) {
    try {
      const set = await $.theme.set(args)
      if (!set.isDrawn) $.ui.status(set.reason)
      return
    } catch (error) {
      $.ui.log(`${w.id}: ${String(error)}`)
      if (i === tries.length - 1) throw error
    }
  }
}

const menu = (now: Wave) =>
  WAVES.map(w => `${w.id === now.id ? '▸' : ' '} ${w.id.padEnd(10)} ${w.blurb}`).join('\n') +
  '\n\n/wave <name> to switch, /wave next to cycle.'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'wave',
      description: 'Switch the ASCII theme: ' + WAVES.map(w => w.id).join(', '),
      argumentHint: '[name | next]',
    })
    await apply($, await current($))
    return next(e)
  })

  on('command.run', { command: 'wave' }, async ($, e) => {
    const now = await current($)
    const arg = e.args.trim().toLowerCase()
    if (!arg) return { text: menu(now) }

    const target =
      arg === 'next'
        ? (WAVES[(WAVES.indexOf(now) + 1) % WAVES.length] ?? fallback)
        : WAVES.find(w => w.id === arg || w.id.startsWith(arg))
    if (!target) return { text: `No wave called "${arg}".\n\n${menu(now)}` }

    await $.store.set(KEY, target.id)
    await apply($, target)
    return { text: `${target.label}: ${target.blurb}` }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)
    const w = find(e.props.scene)
    if (!w) return next(e)
    const { Svg } = $.ui.resolve(e)
    return <Svg source={w.scene} alt={`${w.label}: ${w.blurb}`} isInteractive />
  })
}
