import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { ReglerLePartageStatistiquesValidation } from './regler-le-partage-statistiques.validation'

export const REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ReglerLePartageStatistiquesValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('regler-le-partage-statistiques.action')
