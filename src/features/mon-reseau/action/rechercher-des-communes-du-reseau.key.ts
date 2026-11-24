import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { SelectOption } from '@/libraries/ui/form/utils/options'

export const RECHERCHER_DES_COMMUNES_DU_RESEAU_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<readonly SelectOption[], string>>
>('mon-reseau.rechercher-des-communes')
