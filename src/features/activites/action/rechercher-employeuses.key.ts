import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY = keyFor<
  (input: {
    recherche: string
    exclues: string[]
  }) => Promise<ServerActionResult<readonly OptionDEmployeuse[], string>>
>('activites.rechercher-les-employeuses-de-la-liste')

export type OptionDEmployeuse = {
  readonly id: string
  readonly nom: string
  readonly commune: string | null
}
