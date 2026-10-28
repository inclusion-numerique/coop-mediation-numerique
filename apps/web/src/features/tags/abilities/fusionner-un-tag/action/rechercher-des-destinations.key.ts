import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { DestinationAffichee } from '../ui/destination-affichee'
import type { RechercherDesDestinationsValidation } from './rechercher-des-destinations.validation'

export const RECHERCHER_DES_DESTINATIONS_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RechercherDesDestinationsValidation>,
  ) => Promise<ServerActionResult<readonly DestinationAffichee[], string>>
>('rechercher-des-destinations.action')
