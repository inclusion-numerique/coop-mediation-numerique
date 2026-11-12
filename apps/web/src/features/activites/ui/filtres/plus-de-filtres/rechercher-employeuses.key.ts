import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { OptionDEmployeuse } from '../filtres-de-la-liste'

export const RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY = keyFor<
  (input: {
    recherche: string
    exclues: string[]
  }) => Promise<ServerActionResult<readonly OptionDEmployeuse[], string>>
>('activites.rechercher-les-employeuses-de-la-liste')
