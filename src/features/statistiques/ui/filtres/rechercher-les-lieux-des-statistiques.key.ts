import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'

export type GenreDuFiltreDeLieu = 'LieuDActivite' | 'Commune' | 'Departement'

export const RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY = keyFor<
  (input: {
    genre: GenreDuFiltreDeLieu
    recherche: string
  }) => Promise<ServerActionResult<readonly SelectOption[], string>>
>('rechercher-les-lieux-des-statistiques.action')
