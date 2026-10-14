'use server'

import type { SessionUser } from '@app/web/auth/sessionUser'
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
  EmailInvitation,
  UtilisateurId,
} from '@app/web/features/equipe/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { failure, type Result } from '@app/web/libraries/result'

const nomAffiche = (user: SessionUser): string =>
  user.name ??
  ([user.firstName, user.lastName].filter(Boolean).join(' ') || user.email)

export const inviterDesMembresAction = actionBuilder()
  .use(withAuth())
  .use(withInput(InviterDesMembresValidation))
  .execute(
    fromResult(
      async ({
        user,
        input,
      }): Promise<
        Result<
          InvitationsEnvoyees,
          ActionNonAutorisee | AucuneInvitationAEnvoyer
        >
      > =>
        user.coordinateur == null
          ? failure(ActionNonAutorisee())
          : inviterDesMembres({
              coordinateur: {
                id: CoordinateurId(user.coordinateur.id),
                nom: nomAffiche(user),
              },
              candidats: input.emails.map(EmailInvitation),
              auteurId: UtilisateurId(user.id),
            }),
      { onError: INVITER_DES_MEMBRES_ERRORS },
    ),
  )
