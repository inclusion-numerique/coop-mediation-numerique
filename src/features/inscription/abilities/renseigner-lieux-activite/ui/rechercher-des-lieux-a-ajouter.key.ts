import type { suggestionsAffichees } from '@/features/lieux-activite/ui'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const RECHERCHER_DES_LIEUX_A_AJOUTER_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<
    ServerActionResult<Parameters<typeof suggestionsAffichees>[0], string>
  >
>('inscription.rechercher-des-lieux-a-ajouter')
