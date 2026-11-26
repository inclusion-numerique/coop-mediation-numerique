'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RETIRER_UN_MEMBRE_ERRORS } from '@/features/equipe/abilities/retirer-un-membre/action/retirer-un-membre.errors'
import { RetirerUnMembreValidation } from '@/features/equipe/abilities/retirer-un-membre/action/retirer-un-membre.validation'
import { retirerUnMembre } from '@/features/equipe/abilities/retirer-un-membre/domain/retirer-un-membre'
import { archiverLAdhesion } from '@/features/equipe/abilities/retirer-un-membre/implementations/prisma/archiver-l-adhesion.mutation'
import {
  CoordinateurId,
  MediateurId,
  UtilisateurId,
} from '@/features/equipe/domain'
import { lireLesAdhesionsDeLaPaire } from '@/features/equipe/implementations/prisma/adhesion.query'
import { gestionnaireDe } from '@/features/equipe/implementations/session'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

export const retirerUnMembreAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(RetirerUnMembreValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        retirerUnMembre({ lireLesAdhesionsDeLaPaire, archiverLAdhesion })({
          mediateurId: MediateurId(input.mediateurId),
          coordinateurId: CoordinateurId(input.coordinateurId),
          gestionnaire: gestionnaireDe(user),
          auteurId: UtilisateurId(user.id),
          maintenant: new Date(),
        }),
      { onError: RETIRER_UN_MEMBRE_ERRORS },
    ),
  )
