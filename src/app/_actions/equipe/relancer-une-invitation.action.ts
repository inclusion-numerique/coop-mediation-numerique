'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { relancerUneInvitation } from '@/features/equipe/abilities/relancer-une-invitation'
import { RELANCER_UNE_INVITATION_ERRORS } from '@/features/equipe/abilities/relancer-une-invitation/action/relancer-une-invitation.errors'
import { RelancerUneInvitationValidation } from '@/features/equipe/abilities/relancer-une-invitation/action/relancer-une-invitation.validation'
import {
  CoordinateurId,
  Email,
  ReferenceInvitation,
  UtilisateurId,
} from '@/features/equipe/domain'
import { gestionnaireDe } from '@/features/equipe/implementations/session'
import { withMaintenance } from '@/features/maintenance-mode'
import { fromResult, withInput } from '@/libraries/nextjs'

export const relancerUneInvitationAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
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
