import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { TagAffiche } from '../../../ui/tag-affiche'
import type { CreerUnTagValidation } from './creer-un-tag.validation'

export const CREER_UN_TAG_ACTION_KEY = keyFor<
  (
    input: z.input<typeof CreerUnTagValidation>,
  ) => Promise<ServerActionResult<TagAffiche, string>>
>('creer-un-tag.action')
