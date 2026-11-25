import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { StructureEmployeuseLieuValidation } from './ajouter-structure-employeuse-en-lieu.validation'

export const AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ACTION_KEY = keyFor<
  (
    input: z.input<typeof StructureEmployeuseLieuValidation>,
  ) => Promise<ServerActionResult<unknown, string>>
>('ajouter-structure-employeuse-en-lieu.action')
