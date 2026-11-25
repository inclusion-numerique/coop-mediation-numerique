import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { TagAffiche } from '../../../ui/presenters/tag-affiche.presenter'
import type { RechercherDesDestinationsValidation } from './rechercher-des-destinations.validation'

export const RECHERCHER_DES_DESTINATIONS_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RechercherDesDestinationsValidation>,
  ) => Promise<ServerActionResult<readonly DestinationAffichee[], string>>
>('rechercher-des-destinations.action')

export type DestinationAffichee = {
  readonly tag: TagAffiche
  readonly accompagnements: number
}
