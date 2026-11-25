import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { MediateurAAjouter } from '../domain'
import type { RechercherDesMediateursAAjouterValidation } from './rechercher-des-mediateurs-a-ajouter.validation'

export const RECHERCHER_DES_MEDIATEURS_A_AJOUTER_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RechercherDesMediateursAAjouterValidation>,
  ) => Promise<ServerActionResult<readonly MediateurAAjouter[], string>>
>('rechercher-des-mediateurs-a-ajouter.action')
