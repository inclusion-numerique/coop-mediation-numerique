import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
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
