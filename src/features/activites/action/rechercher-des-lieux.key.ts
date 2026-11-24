import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { LieuTrouveParLeCra } from '../ui/presenters/saisie/lieu-du-cra.presenter'

export const RECHERCHER_DES_LIEUX_DU_CRA_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<readonly LieuTrouveParLeCra[], string>>
>('activites.rechercher-des-lieux')
