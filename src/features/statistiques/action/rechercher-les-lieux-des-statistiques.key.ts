import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export type GenreDuFiltreDeLieu = 'LieuDActivite' | 'Commune' | 'Departement'

type OptionTrouvee = {
  readonly label: string
  readonly value: string
}

export const RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY = keyFor<
  (input: {
    genre: GenreDuFiltreDeLieu
    recherche: string
  }) => Promise<ServerActionResult<readonly OptionTrouvee[], string>>
>('rechercher-les-lieux-des-statistiques.action')
