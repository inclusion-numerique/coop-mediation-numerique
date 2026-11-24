import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const RECHERCHER_DES_TAGS_DU_CRA_KEY = keyFor<
  (input: {
    recherche: string
    exclus?: string[]
  }) => Promise<ServerActionResult<readonly TagDuCra[], string>>
>('activites.rechercher-des-tags')

export type PorteeDuTag = 'Personnel' | 'Equipe' | 'Departemental' | 'National'

export type EquipeDuTag = {
  readonly numero: number
  readonly coordonneePar: string
}

export type TagDuCra = {
  readonly id: string
  readonly nom: string
  readonly description: string | null
  readonly portee: PorteeDuTag
  readonly equipe: EquipeDuTag | null
}
