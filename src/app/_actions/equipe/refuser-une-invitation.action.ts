'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { getSessionUser } from '@/features/authentification/implementations/session/session-user'
import { REFUSER_UNE_INVITATION_ERRORS } from '@/features/equipe/abilities/refuser-une-invitation/action/refuser-une-invitation.errors'
import { RefuserUneInvitationValidation } from '@/features/equipe/abilities/refuser-une-invitation/action/refuser-une-invitation.validation'
import { refuserUneInvitation } from '@/features/equipe/abilities/refuser-une-invitation/implementations/prisma/refuser-une-invitation.mutation'
import {
  CoordinateurId,
  Courriel,
  ReferenceInvitation,
  UtilisateurId,
} from '@/features/equipe/domain'
import { fromResult, withInput } from '@/libraries/nextjs'

export const refuserUneInvitationAction = actionBuilder()
  .use(withInput(RefuserUneInvitationValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const user = await getSessionUser()
        return refuserUneInvitation({
          reference: ReferenceInvitation({
            email: Courriel(input.email),
            coordinateurId: CoordinateurId(input.coordinateurId),
          }),
          auteurId: user == null ? null : UtilisateurId(user.id),
        })
      },
      { onError: REFUSER_UNE_INVITATION_ERRORS },
    ),
  )
