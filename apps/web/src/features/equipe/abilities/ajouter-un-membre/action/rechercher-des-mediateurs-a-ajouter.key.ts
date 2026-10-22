import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { MediateurAAjouter } from '../domain'
import type { RechercherDesMediateursAAjouterValidation } from './rechercher-des-mediateurs-a-ajouter.validation'

export const RECHERCHER_DES_MEDIATEURS_A_AJOUTER_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RechercherDesMediateursAAjouterValidation>,
  ) => Promise<ServerActionResult<readonly MediateurAAjouter[], string>>
>('rechercher-des-mediateurs-a-ajouter.action')
