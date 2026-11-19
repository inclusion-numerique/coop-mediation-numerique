import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { ChoisirLaVisibiliteApresRuptureValidation } from './choisir-la-visibilite-apres-rupture.validation'

export const CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ChoisirLaVisibiliteApresRuptureValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('choisir-la-visibilite-apres-rupture.action')
