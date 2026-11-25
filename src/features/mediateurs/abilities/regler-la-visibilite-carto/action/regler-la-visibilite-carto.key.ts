import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type {
  ReglerLaVisibiliteCartoValidation,
  ReglerMaVisibiliteCartoValidation,
} from './regler-la-visibilite-carto.validation'

export const REGLER_MA_VISIBILITE_CARTO_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ReglerMaVisibiliteCartoValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('regler-ma-visibilite-carto.action')

export const REGLER_LA_VISIBILITE_CARTO_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ReglerLaVisibiliteCartoValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('regler-la-visibilite-carto.action')
