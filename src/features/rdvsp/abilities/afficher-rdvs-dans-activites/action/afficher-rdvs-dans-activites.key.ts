import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { AfficherRdvsDansActivitesValidation } from './afficher-rdvs-dans-activites.validation'

export const AFFICHER_RDVS_DANS_ACTIVITES_ACTION_KEY = keyFor<
  (
    input: z.input<typeof AfficherRdvsDansActivitesValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('afficher-rdvs-dans-activites.action')
