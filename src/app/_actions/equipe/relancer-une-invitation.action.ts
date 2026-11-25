'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RELANCER_UNE_INVITATION_ERRORS } from '@/features/equipe/abilities/relancer-une-invitation/action/relancer-une-invitation.errors'
import { RelancerUneInvitationValidation } from '@/features/equipe/abilities/relancer-une-invitation/action/relancer-une-invitation.validation'
import { relancerUneInvitation } from '@/features/equipe/abilities/relancer-une-invitation/implementations/prisma/relancer-une-invitation.mutation'
import {
  CoordinateurId,
  Courriel,
  ReferenceInvitation,
  UtilisateurId,
} from '@/features/equipe/domain'
import { envoyerUneInvitation } from '@/features/equipe/implementations/email'
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
        relancerUneInvitation({ envoyerUneInvitation })({
          reference: ReferenceInvitation({
            email: Courriel(input.email),
            coordinateurId: CoordinateurId(input.coordinateurId),
          }),
          gestionnaire: gestionnaireDe(user),
          auteurId: UtilisateurId(user.id),
        }),
      { onError: RELANCER_UNE_INVITATION_ERRORS },
    ),
  )
