'use server'

import { withAuth } from '@app/web/features/authentification'
import { annulerUneInvitation } from '@app/web/features/equipe/abilities/annuler-une-invitation'
import { ANNULER_UNE_INVITATION_ERRORS } from '@app/web/features/equipe/abilities/annuler-une-invitation/action/annuler-une-invitation.errors'
import { AnnulerUneInvitationValidation } from '@app/web/features/equipe/abilities/annuler-une-invitation/action/annuler-une-invitation.validation'
import {
  CoordinateurId,
  Email,
  ReferenceInvitation,
  UtilisateurId,
} from '@app/web/features/equipe/domain'
import { gestionnaireDe } from '@app/web/features/equipe/implementation/session'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const annulerUneInvitationAction = actionBuilder()
  .use(withAuth())
  .use(withInput(AnnulerUneInvitationValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        annulerUneInvitation({
          reference: ReferenceInvitation({
            email: Email(input.email),
            coordinateurId: CoordinateurId(input.coordinateurId),
          }),
          gestionnaire: gestionnaireDe(user),
          auteurId: UtilisateurId(user.id),
        }),
      { onError: ANNULER_UNE_INVITATION_ERRORS },
    ),
  )
