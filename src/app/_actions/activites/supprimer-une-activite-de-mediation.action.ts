'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ERRORS } from '@/features/activites/abilities/supprimer-une-activite-de-mediation/action/supprimer-une-activite-de-mediation.errors'
import { SupprimerUneActiviteDeMediationValidation } from '@/features/activites/abilities/supprimer-une-activite-de-mediation/action/supprimer-une-activite-de-mediation.validation'
import { supprimerUneActiviteDeMediation } from '@/features/activites/abilities/supprimer-une-activite-de-mediation/domain/supprimer-une-activite-de-mediation'
import { activiteDeMediationDuMediateur } from '@/features/activites/abilities/supprimer-une-activite-de-mediation/implementations/prisma/activite-de-mediation-du-mediateur.query'
import { supprimerLActiviteDeMediation } from '@/features/activites/abilities/supprimer-une-activite-de-mediation/implementations/prisma/supprimer-une-activite-de-mediation.mutation'
import {
  ActiviteId,
  MediateurId,
  UtilisateurId,
} from '@/features/activites/domain'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const supprimerUneActiviteDeMediationAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(SupprimerUneActiviteDeMediationValidation))
  .execute(
    fromResult(
      async ({ user, input }) => {
        const supprimee = await supprimerUneActiviteDeMediation({
          activiteDuMediateur: activiteDeMediationDuMediateur,
          supprimer: supprimerLActiviteDeMediation(UtilisateurId(user.id)),
        })({
          activiteId: ActiviteId(input.activiteId),
          mediateurId:
            user.mediateur == null ? null : MediateurId(user.mediateur.id),
          maintenant: new Date(),
        })
        return supprimee.success ? success(undefined) : supprimee
      },
      { onError: SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ERRORS },
    ),
  )
