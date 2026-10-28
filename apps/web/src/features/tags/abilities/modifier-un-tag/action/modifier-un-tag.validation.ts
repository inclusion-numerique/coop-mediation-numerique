import { z } from 'zod'
import { SaisieDuTag } from '../../../domain'

export const ModifierUnTagValidation = SaisieDuTag.extend({
  tagId: z.guid(),
})
