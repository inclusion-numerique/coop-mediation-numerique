'use server'

import { withAuth } from '@app/web/features/authentification'
import { relancerUneInvitation } from '@app/web/features/equipe/abilities/relancer-une-invitation'
import { RELANCER_UNE_INVITATION_ERRORS } from '@app/web/features/equipe/abilities/relancer-une-invitation/action/relancer-une-invitation.errors'
import { RelancerUneInvitationValidation } from '@app/web/features/equipe/abilities/relancer-une-invitation/action/relancer-une-invitation.validation'
import {
  CoordinateurId,
  Email,
  ReferenceInvitation,
  UtilisateurId,
} from '@app/web/features/equipe/domain'
import { gestionnaireDe } from '@app/web/features/equipe/implementation/session'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const relancerUneInvitationAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RelancerUneInvitationValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        relancerUneInvitation({
          reference: ReferenceInvitation({
            email: Email(input.email),
            coordinateurId: CoordinateurId(input.coordinateurId),
          }),
          gestionnaire: gestionnaireDe(user),
          auteurId: UtilisateurId(user.id),
        }),
      { onError: RELANCER_UNE_INVITATION_ERRORS },
    ),
  )
