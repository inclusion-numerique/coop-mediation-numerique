import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { RenseignerStructureEmployeuseValidation } from '../domain/employeuse-choisie'

export const RENSEIGNER_STRUCTURE_EMPLOYEUSE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RenseignerStructureEmployeuseValidation>,
  ) => Promise<ServerActionResult<{ readonly rattachee: boolean }, string>>
>('renseigner-structure-employeuse.action')
