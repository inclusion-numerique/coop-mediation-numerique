import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

type OptionTrouvee = { readonly label: string; readonly value: string }

export const RECHERCHER_DES_MEDIATEURS_DES_ACTIVITES_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<readonly OptionTrouvee[], string>>
>('activites.rechercher-des-mediateurs')
