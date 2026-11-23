import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const RECHERCHER_UN_LIEU_A_FUSIONNER_ACTION_KEY = keyFor<
  (input: { recherche: string }) => Promise<
    ServerActionResult<
      {
        readonly structures: readonly {
          readonly id: string
          readonly nom: string
          readonly adresse: string
          readonly commune: string
          readonly codePostal: string
        }[]
        readonly matchesCount: number
      },
      string
    >
  >
>('rechercher-un-lieu-a-fusionner.action')
