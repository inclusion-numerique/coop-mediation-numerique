'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { signaler } from '@/configuration/telemetry/serveur'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RELANCER_UNE_INVITATION_ERRORS } from '@/features/equipe/abilities/relancer-une-invitation/action/relancer-une-invitation.errors'
import { RelancerUneInvitationValidation } from '@/features/equipe/abilities/relancer-une-invitation/action/relancer-une-invitation.validation'
import { relancerUneInvitation } from '@/features/equipe/abilities/relancer-une-invitation/domain/relancer-une-invitation'
import { enregistrerLaRelance } from '@/features/equipe/abilities/relancer-une-invitation/implementations/prisma/enregistrer-la-relance.mutation'
import {
  CoordinateurId,
  Courriel,
  ReferenceInvitation,
  UtilisateurId,
} from '@/features/equipe/domain'
import { envoyerUneInvitation } from '@/features/equipe/implementations/email'
import { lireLeCoordinateur } from '@/features/equipe/implementations/prisma/coordinateur.query'
import { lireUneInvitation } from '@/features/equipe/implementations/prisma/invitation.query'
import { gestionnaireDe } from '@/features/equipe/implementations/session'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

export const relancerUneInvitationAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(RelancerUneInvitationValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        relancerUneInvitation({
          lireUneInvitation,
          lireLeCoordinateur,
          envoyerUneInvitation,
          signaler,
          enregistrerLaRelance,
        })({
          reference: ReferenceInvitation({
            email: Courriel(input.email),
            coordinateurId: CoordinateurId(input.coordinateurId),
          }),
          gestionnaire: gestionnaireDe(user),
          auteurId: UtilisateurId(user.id),
          maintenant: new Date(),
        }),
      { onError: RELANCER_UNE_INVITATION_ERRORS },
    ),
  )
