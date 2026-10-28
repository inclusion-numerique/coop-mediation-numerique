import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { TagDuCra } from './tag-du-cra'

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
