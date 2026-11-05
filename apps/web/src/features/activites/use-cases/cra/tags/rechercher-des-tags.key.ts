import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { TagDuCra } from './tag-du-cra'

export const RECHERCHER_DES_TAGS_DU_CRA_KEY = keyFor<
  (input: {
    recherche: string
    exclus?: string[]
  }) => Promise<ServerActionResult<readonly TagDuCra[], string>>
>('activites.rechercher-des-tags')
