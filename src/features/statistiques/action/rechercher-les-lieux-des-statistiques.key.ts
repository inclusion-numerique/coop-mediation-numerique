import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { SelectOption } from '@/libraries/ui'

export type GenreDuFiltreDeLieu = 'LieuDActivite' | 'Commune' | 'Departement'

export const RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY = keyFor<
  (input: {
    genre: GenreDuFiltreDeLieu
    recherche: string
  }) => Promise<ServerActionResult<readonly SelectOption[], string>>
>('rechercher-les-lieux-des-statistiques.action')
