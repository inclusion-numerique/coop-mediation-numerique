import type { TagDuCra } from '@/features/activites/ui/presenters/saisie/tag-du-cra'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const CREER_UN_TAG_DU_CRA_KEY = keyFor<
  (input: {
    nom: string
    description: string | null
    visibilite:
      | { _tag: 'Personnel' }
      | { _tag: 'Equipe'; coordinateurId: string }
      | { _tag: 'Departemental' }
  }) => Promise<ServerActionResult<TagDuCra, string>>
>('activites.creer-un-tag')
