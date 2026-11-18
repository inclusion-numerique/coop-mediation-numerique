import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { AfficherRdvsDansActivitesValidation } from './afficher-rdvs-dans-activites.validation'

export const AFFICHER_RDVS_DANS_ACTIVITES_ACTION_KEY = keyFor<
  (
    input: z.input<typeof AfficherRdvsDansActivitesValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('afficher-rdvs-dans-activites.action')
