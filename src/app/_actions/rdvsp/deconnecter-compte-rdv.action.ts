'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { DECONNECTER_COMPTE_RDV_ERRORS } from '@/features/rdvsp/abilities/deconnecter-compte-rdv/action/deconnecter-compte-rdv.errors'
import { deconnecterCompteRdv } from '@/features/rdvsp/abilities/deconnecter-compte-rdv/domain/deconnecter-compte-rdv'
import { compteRdvDeLUtilisateur } from '@/features/rdvsp/abilities/deconnecter-compte-rdv/implementations/prisma/compte-rdv-de-l-utilisateur.query'
import { enregistrerLeCompteDeconnecte } from '@/features/rdvsp/abilities/deconnecter-compte-rdv/implementations/prisma/enregistrer-le-compte-deconnecte.mutation'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { fromResult } from '@/libraries/nextjs'

const deconnecter = deconnecterCompteRdv({
  compteDeLUtilisateur: compteRdvDeLUtilisateur,
  enregistrer: enregistrerLeCompteDeconnecte,
})

/**
 * Aucune donnée n'est rendue au client : le compte délié ne porte plus rien
 * d'exploitable côté navigateur, qui se contente de rafraîchir la page.
 */
export const deconnecterCompteRdvAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .execute(
    fromResult(
      async ({ user }) => {
        const resultat = await deconnecter({
          utilisateurId: UtilisateurCoopId(user.id),
          maintenant: new Date(),
        })

        return resultat.success
          ? { success: true as const, data: undefined }
          : resultat
      },
      { onError: DECONNECTER_COMPTE_RDV_ERRORS },
    ),
  )
