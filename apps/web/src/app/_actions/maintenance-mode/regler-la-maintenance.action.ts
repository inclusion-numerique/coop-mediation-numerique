'use server'

import { actionBuilder } from '@app/web/configuration/nextjs'
import { withAdmin, withAuth } from '@app/web/features/authentification'
import { reglerLaMaintenance } from '@app/web/features/maintenance-mode/abilities/regler-la-maintenance'
import { ReglerLaMaintenanceValidation } from '@app/web/features/maintenance-mode/abilities/regler-la-maintenance/action/regler-la-maintenance.validation'
import { withInput } from '@app/web/libraries/nextjs'

export const reglerLaMaintenanceAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ReglerLaMaintenanceValidation))
  .execute(({ user, input }) =>
    reglerLaMaintenance({ demande: input, auteurId: user.id }),
  )
