import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { DeconnecterUnUtilisateurValidation } from './deconnecter-un-utilisateur.validation'

export const DECONNECTER_UN_UTILISATEUR_ACTION_KEY = keyFor<
  (
    input: z.input<typeof DeconnecterUnUtilisateurValidation>,
  ) => Promise<ServerActionResult<{ readonly sessionsFermees: number }, string>>
>('deconnecter-un-utilisateur.action')
