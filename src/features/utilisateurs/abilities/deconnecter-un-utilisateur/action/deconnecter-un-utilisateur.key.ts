import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { DeconnecterUnUtilisateurValidation } from './deconnecter-un-utilisateur.validation'

export const DECONNECTER_UN_UTILISATEUR_ACTION_KEY = keyFor<
  (
    input: z.input<typeof DeconnecterUnUtilisateurValidation>,
  ) => Promise<ServerActionResult<{ readonly sessionsFermees: number }, string>>
>('deconnecter-un-utilisateur.action')
