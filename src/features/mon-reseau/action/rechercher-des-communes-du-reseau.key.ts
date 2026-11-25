import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { SelectOption } from '@/libraries/ui/form'

export const RECHERCHER_DES_COMMUNES_DU_RESEAU_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<readonly SelectOption[], string>>
>('mon-reseau.rechercher-des-communes')
