import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { SelectOption } from '@/libraries/ui/form/utils/options'

export type GenreDuFiltreDeLieu = 'LieuDActivite' | 'Commune' | 'Departement'

export const RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY = keyFor<
  (input: {
    genre: GenreDuFiltreDeLieu
    recherche: string
  }) => Promise<ServerActionResult<readonly SelectOption[], string>>
>('rechercher-les-lieux-des-statistiques.action')
