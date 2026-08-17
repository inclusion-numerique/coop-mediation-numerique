'use server'

import { withAuth } from '@app/web/features/authentification'
import { consulterRdvsAccueil } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/consulter-rdvs-accueil'
import { compteDuMediateur } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/prisma/compte-du-mediateur.query'
import { lireDonneesAccueilRdv } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/prisma/donnees-accueil-rdv.query'
import { DECLENCHER_SYNCHRONISATION_ERRORS } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/action/declencher-synchronisation.errors'
import { declencherSynchronisationBinding as declencher } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/implementation/declencher-synchronisation.binding'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { actionBuilder, fromResult } from '@app/web/libraries/nextjs'
import { success } from '@app/web/libraries/result'

const consulter = consulterRdvsAccueil({
  compteDuMediateur,
  lireDonnees: lireDonneesAccueilRdv,
})

/**
 * Rattrape les rendez-vous des organisations sans webhook, puis relit la
 * projection de l'accueil.
 *
 * Deux abilities sont composées ici, et non l'une dans l'autre : c'est l'écran
 * qui a besoin des deux, pas la synchronisation qui a besoin du widget (IS-1).
 * La projection est celle du rendu initial — une seule forme de part et d'autre.
 */
export const rafraichirAccueilRdvAction = actionBuilder()
  .use(withAuth())
  .execute(
    fromResult(
      async ({ user }) => {
        const utilisateurId = UtilisateurCoopId(user.id)

        const synchronisation = await declencher({
          demandeur: { id: utilisateurId, role: user.role },
          utilisateurId,
          seulementSansWebhook: true,
        })

        if (!synchronisation.success) {
          return synchronisation
        }

        // Rien n'a bougé : l'écran garde ce qu'il affiche déjà, et la lecture
        // des compteurs est épargnée.
        if (synchronisation.data.derive === 0) {
          return success({ derive: 0, donnees: null })
        }

        const widget = await consulter({
          utilisateurId,
          maintenant: new Date(),
        })

        return success({
          derive: synchronisation.data.derive,
          donnees: widget._tag === 'donnees' ? widget.donnees : null,
        })
      },
      { onError: DECLENCHER_SYNCHRONISATION_ERRORS },
    ),
  )
