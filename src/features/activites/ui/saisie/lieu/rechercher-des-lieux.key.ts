import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libs/injection/client'
import type { LieuTrouveParLeCra } from './lieu-du-cra'

export const RECHERCHER_DES_LIEUX_DU_CRA_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<readonly LieuTrouveParLeCra[], string>>
>('activites.rechercher-des-lieux')
