'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { reglerLaMaintenance } from '@app/web/features/maintenance-mode/abilities/regler-la-maintenance'
import { ReglerLaMaintenanceValidation } from '@app/web/features/maintenance-mode/abilities/regler-la-maintenance/action/regler-la-maintenance.validation'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

export const reglerLaMaintenanceAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ReglerLaMaintenanceValidation))
  .execute(({ user, input }) =>
    reglerLaMaintenance({ demande: input, auteurId: user.id }),
  )
