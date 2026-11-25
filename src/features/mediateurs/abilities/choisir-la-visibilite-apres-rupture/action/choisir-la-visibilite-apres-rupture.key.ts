import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { ChoisirLaVisibiliteApresRuptureValidation } from './choisir-la-visibilite-apres-rupture.validation'

export const CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ChoisirLaVisibiliteApresRuptureValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('choisir-la-visibilite-apres-rupture.action')
