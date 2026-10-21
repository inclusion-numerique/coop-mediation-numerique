'use server'

import { getSessionUser } from '@app/web/auth/getSessionUser'
import { refuserUneInvitation } from '@app/web/features/equipe/abilities/refuser-une-invitation'
import { REFUSER_UNE_INVITATION_ERRORS } from '@app/web/features/equipe/abilities/refuser-une-invitation/action/refuser-une-invitation.errors'
import { RefuserUneInvitationValidation } from '@app/web/features/equipe/abilities/refuser-une-invitation/action/refuser-une-invitation.validation'
import {
  CoordinateurId,
  Email,
  ReferenceInvitation,
  UtilisateurId,
} from '@app/web/features/equipe/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const refuserUneInvitationAction = actionBuilder()
  .use(withInput(RefuserUneInvitationValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const user = await getSessionUser()
        return refuserUneInvitation({
          reference: ReferenceInvitation({
            email: Email(input.email),
            coordinateurId: CoordinateurId(input.coordinateurId),
          }),
          auteurId: user == null ? null : UtilisateurId(user.id),
        })
      },
      { onError: REFUSER_UNE_INVITATION_ERRORS },
    ),
  )
