'use server'

import type { SessionUser } from '@app/web/auth/sessionUser'
import { withAuth } from '@app/web/features/authentification'
import {
  type Accepteur,
  accepterUneInvitation,
} from '@app/web/features/equipe/abilities/accepter-une-invitation'
import { ACCEPTER_UNE_INVITATION_ERRORS } from '@app/web/features/equipe/abilities/accepter-une-invitation/action/accepter-une-invitation.errors'
import { AccepterUneInvitationValidation } from '@app/web/features/equipe/abilities/accepter-une-invitation/action/accepter-une-invitation.validation'
import {
  CoordinateurId,
  EmailInvitation,
  MediateurId,
  ReferenceInvitation,
  UtilisateurId,
} from '@app/web/features/equipe/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

const accepteurDe = (user: SessionUser): Accepteur => {
  const email = EmailInvitation(user.email)
  return user.inscriptionValidee != null && user.mediateur?.id != null
    ? {
        type: 'InscriptionValidee',
        email,
        mediateurId: MediateurId(user.mediateur.id),
      }
    : { type: 'InscriptionEnCours', email }
}

export const accepterUneInvitationAction = actionBuilder()
  .use(withAuth())
  .use(withInput(AccepterUneInvitationValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        accepterUneInvitation({
          reference: ReferenceInvitation({
            email: EmailInvitation(input.email),
            coordinateurId: CoordinateurId(input.coordinateurId),
          }),
          accepteur: accepteurDe(user),
          auteurId: UtilisateurId(user.id),
        }),
      { onError: ACCEPTER_UNE_INVITATION_ERRORS },
    ),
  )
