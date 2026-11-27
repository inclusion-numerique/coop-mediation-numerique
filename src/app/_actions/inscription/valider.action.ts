'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { signaler } from '@/configuration/telemetry/serveur'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { accepterLesInvitationsEnAttente } from '@/features/equipe/abilities/accepter-les-invitations-en-attente/domain/accepter-les-invitations-en-attente'
import { enregistrerLesAcceptations } from '@/features/equipe/abilities/accepter-les-invitations-en-attente/implementations/prisma/enregistrer-les-acceptations.mutation'
import {
  lireLeMediateurInvite,
  lireLesInvitationsDe,
} from '@/features/equipe/abilities/accepter-les-invitations-en-attente/implementations/prisma/mediateur-invite.query'
import { UtilisateurId as UtilisateurDeLEquipe } from '@/features/equipe/domain'
import { VALIDER_ERRORS } from '@/features/inscription/abilities/valider/action/valider.errors'
import { ValiderValidation } from '@/features/inscription/abilities/valider/action/valider.validation'
import type { AccepterLesInvitations } from '@/features/inscription/abilities/valider/domain/ports'
import { valider } from '@/features/inscription/abilities/valider/domain/valider'
import { enregistrerValidation } from '@/features/inscription/abilities/valider/implementations/prisma/enregistrer-validation.mutation'
import { lireFaitsInscription } from '@/features/inscription/abilities/valider/implementations/prisma/lire-faits-inscription.query'
import { UtilisateurId } from '@/features/inscription/domain'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { inscrireALaListeDeDiffusion } from '@/features/utilisateurs/abilities/inscrire-a-la-liste-de-diffusion/domain/inscrire-a-la-liste-de-diffusion'
import { UtilisateurId as UtilisateurDeLaListe } from '@/features/utilisateurs/domain'
import { inscrireLeContactALaListe } from '@/features/utilisateurs/implementations/brevo/liste-de-diffusion.mutation'
import { inscritAInscrire } from '@/features/utilisateurs/implementations/prisma/inscrit-a-inscrire.query'
import { fromResult, withInput } from '@/libraries/nextjs'
import { enEchecTechnique, failure, success } from '@/libraries/result'

const inscrireALaListe = inscrireALaListeDeDiffusion({
  lireLInscritAInscrire: inscritAInscrire,
  importerLeContact: inscrireLeContactALaListe,
})

const accepterLesInvitationsDeLInscrit: AccepterLesInvitations = async ({
  userId,
  maintenant,
}) => {
  try {
    await accepterLesInvitationsEnAttente({
      lireLeMediateurInvite,
      lireLesInvitationsDe,
      enregistrerLesAcceptations,
    })({ utilisateurId: UtilisateurDeLEquipe(userId), maintenant })
    return success(undefined)
  } catch (erreur) {
    return failure(enEchecTechnique(erreur))
  }
}

const validerLInscription = valider({
  lireFaitsInscription,
  enregistrerValidation,
  inscrireALaListeDeDiffusion: ({ utilisateurId }) =>
    inscrireALaListe({ utilisateurId: UtilisateurDeLaListe(utilisateurId) }),
  accepterLesInvitations: accepterLesInvitationsDeLInscrit,
  signaler,
})

export const validerAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(ValiderValidation))
  .execute(
    fromResult(
      async ({ user }) => {
        const resultat = await validerLInscription({
          userId: UtilisateurId(user.id),
          maintenant: new Date(),
        })

        return resultat.success ? success(undefined) : resultat
      },
      { onError: VALIDER_ERRORS },
    ),
  )
