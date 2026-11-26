'use server'

import { actionBuilder } from '@/configuration/nextjs'
import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { ACCEPTER_UNE_INVITATION_ERRORS } from '@/features/equipe/abilities/accepter-une-invitation/action/accepter-une-invitation.errors'
import { AccepterUneInvitationValidation } from '@/features/equipe/abilities/accepter-une-invitation/action/accepter-une-invitation.validation'
import { accepterUneInvitation } from '@/features/equipe/abilities/accepter-une-invitation/domain/accepter-une-invitation'
import { type Accepteur } from '@/features/equipe/abilities/accepter-une-invitation/domain/index'
import { enregistrerLAcceptation } from '@/features/equipe/abilities/accepter-une-invitation/implementations/prisma/enregistrer-l-acceptation.mutation'
import {
  CoordinateurId,
  Courriel,
  MediateurId,
  ReferenceInvitation,
  UtilisateurId,
} from '@/features/equipe/domain'
import { prevenirLeCoordinateur } from '@/features/equipe/implementations/email'
import { lireLeCoordinateur } from '@/features/equipe/implementations/prisma/coordinateur.query'
import { lireUneInvitation } from '@/features/equipe/implementations/prisma/invitation.query'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

const accepteurDe = (user: UtilisateurDeLaSession): Accepteur => {
  const email = Courriel(user.email)
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
          lireUneInvitation,
          enregistrerLAcceptation,
          lireLeCoordinateur,
          prevenirLeCoordinateur,
        })({
          reference: ReferenceInvitation({
            email: Courriel(input.email),
            coordinateurId: CoordinateurId(input.coordinateurId),
          }),
          accepteur: accepteurDe(user),
          auteurId: UtilisateurId(user.id),
          maintenant: new Date(),
        }),
      { onError: ACCEPTER_UNE_INVITATION_ERRORS },
    ),
  )
