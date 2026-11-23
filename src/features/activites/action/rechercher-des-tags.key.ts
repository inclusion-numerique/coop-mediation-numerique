import type { TagDuCra } from '@/features/activites/ui/presenters/saisie/tag-du-cra'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const RECHERCHER_DES_TAGS_DU_CRA_KEY = keyFor<
  (input: {
    recherche: string
    exclus?: string[]
  }) => Promise<ServerActionResult<readonly TagDuCra[], string>>
>('activites.rechercher-des-tags')
