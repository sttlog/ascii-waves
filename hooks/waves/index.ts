import type { Wave } from '../wave.ts'
import { chillwave } from './chillwave.ts'
import { darkwave } from './darkwave.ts'
import { dreamwave } from './dreamwave.ts'
import { seapunk } from './seapunk.ts'
import { synthwave } from './synthwave.ts'
import { vaporwave } from './vaporwave.ts'

export const WAVES: readonly Wave[] = [synthwave, vaporwave, darkwave, seapunk, dreamwave, chillwave]
