'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { signaler } from '@/configuration/telemetry/serveur'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { INVITER_DES_MEMBRES_ERRORS } from '@/features/equipe/abilities/inviter-des-membres/action/inviter-des-membres.errors'
import { InviterDesMembresValidation } from '@/features/equipe/abilities/inviter-des-membres/action/inviter-des-membres.validation'
import { inviterDesMembres } from '@/features/equipe/abilities/inviter-des-membres/domain/inviter-des-membres'
import { enregistrerLesInvitations } from '@/features/equipe/abilities/inviter-des-membres/implementations/prisma/enregistrer-les-invitations.mutation'
import { lireLExistant } from '@/features/equipe/abilities/inviter-des-membres/implementations/prisma/existant.query'
import { inviteurDe } from '@/features/equipe/abilities/inviter-des-membres/implementations/session/inviteur.query'
import { Courriel, UtilisateurId } from '@/features/equipe/domain'
import { envoyerUneInvitation } from '@/features/equipe/implementations/email'
import { lireLeCoordinateur } from '@/features/equipe/implementations/prisma/coordinateur.query'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

export const inviterDesMembresAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(InviterDesMembresValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        inviterDesMembres({
          lireLeCoordinateur,
          lireLExistant,
          enregistrerLesInvitations,
          envoyerUneInvitation,
          signaler,
        })({
          inviteur: inviteurDe(user),
          candidats: input.emails.map(Courriel),
          auteurId: UtilisateurId(user.id),
          maintenant: new Date(),
        }),
      { onError: INVITER_DES_MEMBRES_ERRORS },
    ),
  )
