import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const INVITER_L_ACTEUR_DANS_L_EQUIPE_KEY = keyFor<
  (input: { emails: string[] }) => Promise<ServerActionResult<unknown, string>>
>('mon-reseau.inviter-l-acteur-dans-l-equipe')

export const RETIRER_L_ACTEUR_DE_L_EQUIPE_KEY = keyFor<
  (input: {
    mediateurId: string
    coordinateurId: string
  }) => Promise<ServerActionResult<unknown, string>>
>('mon-reseau.retirer-l-acteur-de-l-equipe')
