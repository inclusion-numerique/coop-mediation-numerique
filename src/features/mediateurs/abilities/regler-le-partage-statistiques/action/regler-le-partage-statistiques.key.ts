import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { ReglerLePartageStatistiquesValidation } from './regler-le-partage-statistiques.validation'

export const REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ReglerLePartageStatistiquesValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('regler-le-partage-statistiques.action')
