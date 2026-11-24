import type { SuggestionsDeLieux } from '@/features/lieux-activite/domain/suggestion-de-lieu'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const RECHERCHER_DES_LIEUX_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<SuggestionsDeLieux, string>>
>('ajouter-des-lieux-activite.rechercher-des-lieux')
