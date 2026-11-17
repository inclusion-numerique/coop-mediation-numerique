import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { CompteTrouve } from '../domain'
import type {
  FusionnerDesComptesValidation,
  RechercherDesComptesAFusionnerValidation,
} from './fusionner-des-comptes.validation'

export const FUSIONNER_DES_COMPTES_ACTION_KEY = keyFor<
  (
    input: z.input<typeof FusionnerDesComptesValidation>,
  ) => Promise<ServerActionResult<unknown, string>>
>('fusionner-des-comptes.action')

export const RECHERCHER_DES_COMPTES_A_FUSIONNER_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RechercherDesComptesAFusionnerValidation>,
  ) => Promise<ServerActionResult<readonly CompteTrouve[], string>>
>('rechercher-des-comptes-a-fusionner.action')
