import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { SelectOption } from '@/libraries/ui/form/utils/options'

export const RECHERCHER_DES_MEDIATEURS_DES_ACTIVITES_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<readonly SelectOption[], string>>
>('activites.rechercher-des-mediateurs')
