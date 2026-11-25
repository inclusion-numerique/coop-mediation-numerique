import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { MediateursAInviter } from '../domain'
import type { RechercherDesMediateursAInviterValidation } from './rechercher-des-mediateurs-a-inviter.validation'

export const RECHERCHER_DES_MEDIATEURS_A_INVITER_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RechercherDesMediateursAInviterValidation>,
  ) => Promise<ServerActionResult<MediateursAInviter, string>>
>('rechercher-des-mediateurs-a-inviter.action')
