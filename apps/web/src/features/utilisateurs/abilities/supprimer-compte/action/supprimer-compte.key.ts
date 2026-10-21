import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
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
