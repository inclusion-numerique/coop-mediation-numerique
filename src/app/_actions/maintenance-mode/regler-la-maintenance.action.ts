'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { reglerLaMaintenance } from '@/features/maintenance-mode/abilities/regler-la-maintenance'
import { ReglerLaMaintenanceValidation } from '@/features/maintenance-mode/abilities/regler-la-maintenance/action/regler-la-maintenance.validation'
import { withInput } from '@/libraries/nextjs'

export const reglerLaMaintenanceAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ReglerLaMaintenanceValidation))
  .execute(({ user, input }) =>
    reglerLaMaintenance({ demande: input, auteurId: user.id }),
  )
