import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { SelectOption } from '@/libraries/ui'

export const RECHERCHER_DES_COMMUNES_ACTION_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<readonly SelectOption[], string>>
>('rechercher-des-communes.action')
