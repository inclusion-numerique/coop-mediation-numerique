import type { StructureEmployeuseOption } from '@app/web/features/statistiques/ui/filtres/plus-de-filtres/structure-employeuse-option'
import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'

export const RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY = keyFor<
  (input: {
    recherche: string
    exclues: string[]
  }) => Promise<
    ServerActionResult<readonly StructureEmployeuseOption[], string>
  >
>('rechercher-employeuses-des-activites.action')
