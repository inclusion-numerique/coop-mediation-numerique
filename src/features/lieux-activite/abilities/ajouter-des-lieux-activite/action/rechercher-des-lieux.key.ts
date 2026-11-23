import { type suggestionsAffichees } from '@/features/lieux-activite/ui/presenters/suggestion-de-lieu.presenter'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const RECHERCHER_DES_LIEUX_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<
    ServerActionResult<Parameters<typeof suggestionsAffichees>[0], string>
  >
>('ajouter-des-lieux-activite.rechercher-des-lieux')
