import type { EtatDeMaintenance } from '@app/web/features/maintenance-mode/domain'
import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { ReglerLaMaintenanceValidation } from './regler-la-maintenance.validation'

export const REGLER_LA_MAINTENANCE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ReglerLaMaintenanceValidation>,
  ) => Promise<ServerActionResult<EtatDeMaintenance, string>>
>('regler-la-maintenance.action')
