'use server'

import { withAuth } from '@app/web/features/authentification'
import {
  type InvitationsEnvoyees,
  inviterDesMembres,
} from '@app/web/features/equipe/abilities/inviter-des-membres'
import { INVITER_DES_MEMBRES_ERRORS } from '@app/web/features/equipe/abilities/inviter-des-membres/action/inviter-des-membres.errors'
import { InviterDesMembresValidation } from '@app/web/features/equipe/abilities/inviter-des-membres/action/inviter-des-membres.validation'
import type { AucuneInvitationAEnvoyer } from '@app/web/features/equipe/abilities/inviter-des-membres/domain'
import {
  ActionNonAutorisee,
  CoordinateurId,
  type CoordinateurIntrouvable,
  Email,
  UtilisateurId,
} from '@app/web/features/equipe/domain'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { failure, type Result } from '@app/web/libraries/result'

export const inviterDesMembresAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(InviterDesMembresValidation))
  .execute(
    fromResult(
      async ({
        user,
        input,
      }): Promise<
        Result<
          InvitationsEnvoyees,
          | ActionNonAutorisee
          | AucuneInvitationAEnvoyer
          | CoordinateurIntrouvable
        >
      > =>
        user.coordinateur == null
          ? failure(ActionNonAutorisee())
          : inviterDesMembres({
              coordinateurId: CoordinateurId(user.coordinateur.id),
              candidats: input.emails.map(Email),
              auteurId: UtilisateurId(user.id),
            }),
      { onError: INVITER_DES_MEMBRES_ERRORS },
    ),
  )
