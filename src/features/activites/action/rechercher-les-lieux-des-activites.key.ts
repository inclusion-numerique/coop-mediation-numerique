import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

type OptionTrouvee = { readonly label: string; readonly value: string }

export type GenreDuLieuRecherche = 'LieuDActivite' | 'Commune' | 'Departement'

export const RECHERCHER_LES_LIEUX_DES_ACTIVITES_KEY = keyFor<
  (input: {
    genre: GenreDuLieuRecherche
    recherche: string
  }) => Promise<ServerActionResult<readonly OptionTrouvee[], string>>
>('activites.rechercher-les-lieux-des-activites')
