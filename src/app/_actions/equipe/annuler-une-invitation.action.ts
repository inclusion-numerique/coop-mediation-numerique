'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { ANNULER_UNE_INVITATION_ERRORS } from '@/features/equipe/abilities/annuler-une-invitation/action/annuler-une-invitation.errors'
import { AnnulerUneInvitationValidation } from '@/features/equipe/abilities/annuler-une-invitation/action/annuler-une-invitation.validation'
import { annulerUneInvitation } from '@/features/equipe/abilities/annuler-une-invitation/implementations/prisma/annuler-une-invitation.mutation'
import {
  CoordinateurId,
  Courriel,
  ReferenceInvitation,
  UtilisateurId,
} from '@/features/equipe/domain'
import { gestionnaireDe } from '@/features/equipe/implementations/session'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

export const annulerUneInvitationAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(AnnulerUneInvitationValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        annulerUneInvitation({
          reference: ReferenceInvitation({
            email: Courriel(input.email),
            coordinateurId: CoordinateurId(input.coordinateurId),
          }),
          gestionnaire: gestionnaireDe(user),
          auteurId: UtilisateurId(user.id),
        }),
      { onError: ANNULER_UNE_INVITATION_ERRORS },
    ),
  )
