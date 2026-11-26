'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { accepterLesInvitationsEnAttente } from '@/features/equipe/abilities/accepter-les-invitations-en-attente/implementations/prisma/accepter-les-invitations-en-attente.mutation'
import { VALIDER_ERRORS } from '@/features/inscription/abilities/valider/action/valider.errors'
import { ValiderValidation } from '@/features/inscription/abilities/valider/action/valider.validation'
import type {
  EffetsApresValidation,
  InscrireALaListeDeDiffusion,
} from '@/features/inscription/abilities/valider/domain/ports'
import { valider } from '@/features/inscription/abilities/valider/domain/valider'
import { enregistrerValidation } from '@/features/inscription/abilities/valider/implementations/prisma/enregistrer-validation.mutation'
import { lireFaitsInscription } from '@/features/inscription/abilities/valider/implementations/prisma/lire-faits-inscription.query'
import { UtilisateurId } from '@/features/inscription/domain'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { inscrireALaListeDeDiffusion } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/implementations/brevo/inscrire-a-la-liste-de-diffusion.mutation'
import { inscritAInscrire } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/implementations/prisma/inscrit-a-inscrire.query'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const validerAvec = (
  inscrireALaListeDeDiffusion: InscrireALaListeDeDiffusion,
  effetsApresValidation: EffetsApresValidation,
) =>
  valider({
    lireFaitsInscription,
    enregistrerValidation,
    inscrireALaListeDeDiffusion,
    effetsApresValidation,
  })

export const validerAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(ValiderValidation))
  .execute(
    fromResult(
      async ({ user }) => {
        const resultat = await validerAvec(
          inscrireALaListeDeDiffusion(inscritAInscrire),
          accepterLesInvitationsEnAttente,
        )({ userId: UtilisateurId(user.id), maintenant: new Date() })

        return resultat.success ? success(undefined) : resultat
      },
      { onError: VALIDER_ERRORS },
    ),
  )
