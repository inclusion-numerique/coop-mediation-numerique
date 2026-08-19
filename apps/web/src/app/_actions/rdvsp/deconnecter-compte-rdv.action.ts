'use server'

import { withAuth } from '@app/web/features/authentification'
import { DECONNECTER_COMPTE_RDV_ERRORS } from '@app/web/features/rdvsp/abilities/deconnecter-compte-rdv/action/deconnecter-compte-rdv.errors'
import { deconnecterCompteRdv } from '@app/web/features/rdvsp/abilities/deconnecter-compte-rdv/implementation'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { actionBuilder, fromResult } from '@app/web/libraries/nextjs'

const deconnecter = deconnecterCompteRdv()

/**
 * Aucune donnée n'est rendue au client : le compte délié ne porte plus rien
 * d'exploitable côté navigateur, qui se contente de rafraîchir la page.
 */
export const deconnecterCompteRdvAction = actionBuilder()
  .use(withAuth())
  .execute(
    fromResult(
      async ({ user }) => {
        const resultat = await deconnecter({
          utilisateurId: UtilisateurCoopId(user.id),
        })

        return resultat.success
          ? { success: true as const, data: undefined }
          : resultat
      },
      { onError: DECONNECTER_COMPTE_RDV_ERRORS },
    ),
  )
