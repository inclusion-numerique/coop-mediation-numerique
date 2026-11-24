import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const RECHERCHER_DES_LIEUX_DU_CRA_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<readonly LieuTrouveParLeCra[], string>>
>('activites.rechercher-des-lieux')

export type LieuTrouveParLeCra = {
  readonly id: string
  readonly nom: string
  readonly adresse: {
    readonly voie: string
    readonly code_postal: string
    readonly commune: string
  } | null
  readonly lePlusUtilise: boolean
}
