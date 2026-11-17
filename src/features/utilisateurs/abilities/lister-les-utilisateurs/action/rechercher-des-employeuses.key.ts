import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import type { SelectOption } from '@app/web/libraries/ui/components/Form/utils/options'
import { keyFor } from '@app/web/libs/injection/client'

export const RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<readonly SelectOption[], string>>
>('rechercher-des-employeuses.action')
