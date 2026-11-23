'use server'

import { actionBuilder } from '@/configuration/nextjs'
import type { SessionUser } from '@/features/authentification/domain/sessionUser'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import {
  type Accepteur,
  accepterUneInvitation,
} from '@/features/equipe/abilities/accepter-une-invitation'
import { ACCEPTER_UNE_INVITATION_ERRORS } from '@/features/equipe/abilities/accepter-une-invitation/action/accepter-une-invitation.errors'
import { AccepterUneInvitationValidation } from '@/features/equipe/abilities/accepter-une-invitation/action/accepter-une-invitation.validation'
import {
  CoordinateurId,
  Email,
  MediateurId,
  ReferenceInvitation,
  UtilisateurId,
} from '@/features/equipe/domain'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

const accepteurDe = (user: SessionUser): Accepteur => {
  const email = Email(user.email)
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
  .use(withMaintenance())
  .use(withInput(AccepterUneInvitationValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        accepterUneInvitation({
          reference: ReferenceInvitation({
            email: Email(input.email),
            coordinateurId: CoordinateurId(input.coordinateurId),
          }),
          accepteur: accepteurDe(user),
          auteurId: UtilisateurId(user.id),
        }),
      { onError: ACCEPTER_UNE_INVITATION_ERRORS },
    ),
  )
