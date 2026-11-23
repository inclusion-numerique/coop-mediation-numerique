import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { DestinationAffichee } from '../ui/presenters/destination-affichee'
import type { RechercherDesDestinationsValidation } from './rechercher-des-destinations.validation'

export const RECHERCHER_DES_DESTINATIONS_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RechercherDesDestinationsValidation>,
  ) => Promise<ServerActionResult<readonly DestinationAffichee[], string>>
>('rechercher-des-destinations.action')
