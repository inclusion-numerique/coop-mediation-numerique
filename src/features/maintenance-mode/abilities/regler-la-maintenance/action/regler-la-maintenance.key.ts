import type { z } from 'zod'
import type { EtatDeMaintenance } from '@/features/maintenance-mode/domain'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { ReglerLaMaintenanceValidation } from './regler-la-maintenance.validation'

export const REGLER_LA_MAINTENANCE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ReglerLaMaintenanceValidation>,
  ) => Promise<ServerActionResult<EtatDeMaintenance, string>>
>('regler-la-maintenance.action')
