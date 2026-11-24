import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { OptionDEmployeuse } from '../ui/search-params/filtres-de-la-liste.search-params'

export const RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY = keyFor<
  (input: {
    recherche: string
    exclues: string[]
  }) => Promise<ServerActionResult<readonly OptionDEmployeuse[], string>>
>('activites.rechercher-les-employeuses-de-la-liste')
