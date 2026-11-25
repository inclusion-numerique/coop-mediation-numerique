import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { CompteSupprime } from '../domain'
import type { SupprimerCompteValidation } from './supprimer-compte.validation'

export const SUPPRIMER_LE_COMPTE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof SupprimerCompteValidation>,
  ) => Promise<ServerActionResult<CompteSupprime, string>>
>('supprimer-le-compte.action')

export const SUPPRIMER_MON_COMPTE_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<CompteSupprime, string>>
>('supprimer-mon-compte.action')
