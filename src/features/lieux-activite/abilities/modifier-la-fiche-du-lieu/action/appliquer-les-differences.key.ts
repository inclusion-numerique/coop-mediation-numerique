import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { AppliquerLesDifferencesValidation } from './appliquer-les-differences.validation'

export const APPLIQUER_LES_DIFFERENCES_ACTION_KEY = keyFor<
  (
    input: z.input<typeof AppliquerLesDifferencesValidation>,
  ) => Promise<ServerActionResult<unknown, string>>
>('appliquer-les-differences.action')
