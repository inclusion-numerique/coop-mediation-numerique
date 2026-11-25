import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { RenseignerStructureEmployeuseValidation } from '../domain/employeuse-choisie'

export const RENSEIGNER_STRUCTURE_EMPLOYEUSE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RenseignerStructureEmployeuseValidation>,
  ) => Promise<ServerActionResult<{ readonly rattachee: boolean }, string>>
>('renseigner-structure-employeuse.action')
