import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

type OptionTrouvee = {
  readonly label: string
  readonly value: string
}

export const RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<readonly OptionTrouvee[], string>>
>('rechercher-des-employeuses.action')
