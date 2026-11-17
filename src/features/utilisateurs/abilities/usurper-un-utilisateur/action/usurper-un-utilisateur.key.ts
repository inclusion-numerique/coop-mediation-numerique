import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { UsurperUnUtilisateurValidation } from './usurper-un-utilisateur.validation'

export const USURPER_UN_UTILISATEUR_ACTION_KEY = keyFor<
  (
    input: z.input<typeof UsurperUnUtilisateurValidation>,
  ) => Promise<
    ServerActionResult<
      { readonly nom: string; readonly redirection: string },
      string
    >
  >
>('usurper-un-utilisateur.action')
