import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { DeconnecterUnUtilisateurValidation } from './deconnecter-un-utilisateur.validation'

export const DECONNECTER_UN_UTILISATEUR_ACTION_KEY = keyFor<
  (
    input: z.input<typeof DeconnecterUnUtilisateurValidation>,
  ) => Promise<ServerActionResult<{ readonly sessionsFermees: number }, string>>
>('deconnecter-un-utilisateur.action')
