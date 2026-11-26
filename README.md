# ascii-waves

Six animated ASCII-art themes for the Claude desktop app, each one a different "-wave" aesthetic. Every theme sets the app's colors, restyles the chat in a monospace font, draws a moving backdrop made entirely of text characters, and adds an optional ambient synth soundscape with its own sound cues.

| Theme | Scene |
| --- | --- |
| `synthwave` | A neon sunset over an endless scrolling grid, with shooting stars |
| `vaporwave` | Pastel sky, drifting clouds, steam rising off a rolling sea, floating marble columns (light) |
| `darkwave` | A red-lit city at night in the rain, with neon signs and a wet street |
| `seapunk` | Underwater in neon: light shafts, swaying kelp, fish, bubbles and jellyfish |
| `dreamwave` | Aurora curtains, a crescent moon, snowy peaks and falling snow |
| `chillwave` | A breezy summer afternoon: a turning windmill, grass bending in the wind, drifting seeds (light) |

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install ascii-waves --marketplace sttlog/ascii-waves
```

Answer `y` to add the marketplace, then pick a scope (user is the default).

From a shell:

```bash
claude plugin install ascii-waves --marketplace sttlog/ascii-waves
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `sttlog/ascii-waves`, then **Add plugin**.

## Use

- `/wave` lists the themes and marks the current one.
- `/wave <name>` switches, for example `/wave seapunk` (the start of a name is enough).
- `/wave next` cycles to the next theme.

The theme you pick is remembered for new sessions. To hear the soundscape, press the speaker button in the session's title bar. If you have reduced motion turned on, the scenes are drawn still.

Themes are drawn in the desktop and mobile apps; the terminal keeps its own look.
