'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { ACTIVER_LA_MEDIATION_NUMERIQUE_ERRORS } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/action/activer-la-mediation-numerique.errors'
import { activerLaMediationNumerique } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/domain/activer-la-mediation-numerique'
import { activer } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/implementations/prisma/activer.mutation'
import { compteQuiActive } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/implementations/prisma/compte-qui-active.query'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { inscrireLeContactALaListe } from '@/features/utilisateurs/implementations/brevo/liste-de-diffusion.mutation'
import { inscritAInscrire } from '@/features/utilisateurs/implementations/prisma/inscrit-a-inscrire.query'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { fromResult } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const activerLaMediationNumeriqueAvec = (
  synchroniserLaPersonne: SynchroniserLaPersonne,
) =>
  activerLaMediationNumerique({
    lireLeCompteQuiActive: compteQuiActive,
    activer: activer(synchroniserLaPersonne),
    lireLInscritAInscrire: inscritAInscrire,
    inscrireALaListeDeDiffusion: inscrireLeContactALaListe,
  })

export const activerLaMediationNumeriqueAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .execute(
    fromResult(
      async ({ user }) => {
        const resultat = await activerLaMediationNumeriqueAvec(
          synchroniserPersonne,
        )({ utilisateurId: UtilisateurId.safe(user.id) })
        if (!resultat.success) return resultat
        return success(
          resultat.data._tag === 'DejaActivee' ? 'DejaActivee' : 'AActiver',
        )
      },
      {
        onError: ACTIVER_LA_MEDIATION_NUMERIQUE_ERRORS,
      },
    ),
  )
