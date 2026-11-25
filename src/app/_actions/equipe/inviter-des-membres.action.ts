'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { INVITER_DES_MEMBRES_ERRORS } from '@/features/equipe/abilities/inviter-des-membres/action/inviter-des-membres.errors'
import { InviterDesMembresValidation } from '@/features/equipe/abilities/inviter-des-membres/action/inviter-des-membres.validation'
import type { AucuneInvitationAEnvoyer } from '@/features/equipe/abilities/inviter-des-membres/domain'
import { type InvitationsEnvoyees } from '@/features/equipe/abilities/inviter-des-membres/domain/index'
import { inviterDesMembres } from '@/features/equipe/abilities/inviter-des-membres/implementations/prisma/inviter-des-membres.mutation'
import {
  ActionNonAutorisee,
  CoordinateurId,
  type CoordinateurIntrouvable,
  Courriel,
  UtilisateurId,
} from '@/features/equipe/domain'
import { envoyerUneInvitation } from '@/features/equipe/implementations/email'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'
import { failure, type Result } from '@/libraries/result'

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
          : inviterDesMembres({ envoyerUneInvitation })({
              coordinateurId: CoordinateurId(user.coordinateur.id),
              candidats: input.emails.map(Courriel),
              auteurId: UtilisateurId(user.id),
            }),
      { onError: INVITER_DES_MEMBRES_ERRORS },
    ),
  )
