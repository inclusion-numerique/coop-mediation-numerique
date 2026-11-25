import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
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
