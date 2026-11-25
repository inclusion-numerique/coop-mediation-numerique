import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const RECHERCHER_DES_TAGS_DU_CRA_KEY = keyFor<
  (input: {
    recherche: string
    exclus?: string[]
  }) => Promise<ServerActionResult<readonly TagDuCra[], string>>
>('activites.rechercher-des-tags')

export type BadgeDuTag = {
  readonly libelle: string
  readonly classe: string
  readonly infobulle: string | null
}

export type TagDuCra = {
  readonly id: string
  readonly nom: string
  readonly description: string | null
  readonly badge: BadgeDuTag
}
