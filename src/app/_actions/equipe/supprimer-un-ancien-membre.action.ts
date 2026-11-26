'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { SUPPRIMER_UN_ANCIEN_MEMBRE_ERRORS } from '@/features/equipe/abilities/supprimer-un-ancien-membre/action/supprimer-un-ancien-membre.errors'
import { SupprimerUnAncienMembreValidation } from '@/features/equipe/abilities/supprimer-un-ancien-membre/action/supprimer-un-ancien-membre.validation'
import { supprimerUnAncienMembre } from '@/features/equipe/abilities/supprimer-un-ancien-membre/domain/supprimer-un-ancien-membre'
import { supprimerLesAdhesionsArchivees } from '@/features/equipe/abilities/supprimer-un-ancien-membre/implementations/prisma/supprimer-les-adhesions-archivees.mutation'
import {
  CoordinateurId,
  MediateurId,
  UtilisateurId,
} from '@/features/equipe/domain'
import { lireLesAdhesionsDeLaPaire } from '@/features/equipe/implementations/prisma/adhesion.query'
import { gestionnaireDe } from '@/features/equipe/implementations/session'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

export const supprimerUnAncienMembreAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(SupprimerUnAncienMembreValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        supprimerUnAncienMembre({
          lireLesAdhesionsDeLaPaire,
          supprimerLesAdhesionsArchivees,
        })({
          mediateurId: MediateurId(input.mediateurId),
          coordinateurId: CoordinateurId(input.coordinateurId),
          gestionnaire: gestionnaireDe(user),
          auteurId: UtilisateurId(user.id),
        }),
      { onError: SUPPRIMER_UN_ANCIEN_MEMBRE_ERRORS },
    ),
  )
