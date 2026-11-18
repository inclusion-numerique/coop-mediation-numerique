'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { annulerUneInvitation } from '@/features/equipe/abilities/annuler-une-invitation'
import { ANNULER_UNE_INVITATION_ERRORS } from '@/features/equipe/abilities/annuler-une-invitation/action/annuler-une-invitation.errors'
import { AnnulerUneInvitationValidation } from '@/features/equipe/abilities/annuler-une-invitation/action/annuler-une-invitation.validation'
import {
  CoordinateurId,
  Email,
  ReferenceInvitation,
  UtilisateurId,
} from '@/features/equipe/domain'
import { gestionnaireDe } from '@/features/equipe/implementation/session'
import { withMaintenance } from '@/features/maintenance-mode'
import { fromResult, withInput } from '@/libraries/nextjs'

export const annulerUneInvitationAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
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
