import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

type OptionTrouvee = {
  readonly label: string
  readonly value: string
}

export const RECHERCHER_DES_COMMUNES_DU_RESEAU_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<readonly OptionTrouvee[], string>>
>('mon-reseau.rechercher-des-communes')
