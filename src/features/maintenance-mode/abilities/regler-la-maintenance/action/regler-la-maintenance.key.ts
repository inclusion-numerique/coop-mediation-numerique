import type { z } from 'zod'
import type { EtatDeMaintenance } from '@/features/maintenance-mode/domain'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { ReglerLaMaintenanceValidation } from './regler-la-maintenance.validation'

export const REGLER_LA_MAINTENANCE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ReglerLaMaintenanceValidation>,
  ) => Promise<ServerActionResult<EtatDeMaintenance, string>>
>('regler-la-maintenance.action')
