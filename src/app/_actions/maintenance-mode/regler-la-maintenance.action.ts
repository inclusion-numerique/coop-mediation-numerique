'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { ReglerLaMaintenanceValidation } from '@/features/maintenance-mode/abilities/regler-la-maintenance/action/regler-la-maintenance.validation'
import { reglerLaMaintenance } from '@/features/maintenance-mode/abilities/regler-la-maintenance/domain/regler-la-maintenance'
import { lireLaPeriodeEnCours } from '@/features/maintenance-mode/abilities/regler-la-maintenance/implementations/prisma/periode-en-cours.query'
import {
  changerLeMessage,
  cloreLaPeriode,
  ouvrirUnePeriode,
} from '@/features/maintenance-mode/abilities/regler-la-maintenance/implementations/prisma/regler-la-maintenance.mutation'
import { AuteurId } from '@/features/maintenance-mode/domain'
import { consulterLaMaintenance } from '@/features/maintenance-mode/implementations/prisma/etat-de-maintenance.query'
import { withInput } from '@/libraries/nextjs'

export const reglerLaMaintenanceAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ReglerLaMaintenanceValidation))
  .execute(async ({ user, input }) => {
    await reglerLaMaintenance({
      lireLaPeriodeEnCours,
      ouvrirUnePeriode,
      changerLeMessage,
      cloreLaPeriode,
    })({ demande: input, auteurId: AuteurId(user.id), maintenant: new Date() })

    return consulterLaMaintenance()
  })
