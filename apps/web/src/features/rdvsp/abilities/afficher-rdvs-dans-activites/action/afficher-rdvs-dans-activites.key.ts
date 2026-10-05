import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { key } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { AfficherRdvsDansActivitesValidation } from './afficher-rdvs-dans-activites.validation'

export const AFFICHER_RDVS_DANS_ACTIVITES_ACTION_KEY = key<
  (
    input: z.input<typeof AfficherRdvsDansActivitesValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('afficher-rdvs-dans-activites.action')
