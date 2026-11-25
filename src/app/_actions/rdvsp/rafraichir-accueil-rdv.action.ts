'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/creer-ou-fusionner-depuis-usager-externe.binding'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { consulterRdvsAccueil } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/domain/consulter-rdvs-accueil'
import type { RafraichissementAccueil } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/domain/rafraichissement-accueil'
import { compteDuMediateur } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/implementations/prisma/compte-du-mediateur.query'
import { lireDonneesAccueilRdv } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/implementations/prisma/donnees-accueil-rdv.query'
import { DECLENCHER_SYNCHRONISATION_ERRORS } from '@/features/rdvsp/abilities/declencher-synchronisation/action/declencher-synchronisation.errors'
import { declencherSynchronisationAvec } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/declencher-synchronisation.binding'
import { synchroniserCompteAvec } from '@/features/rdvsp/abilities/synchroniser-compte-rdv/implementations/synchroniser-compte-rdv.binding'
import { synchroniserLesOrganisations } from '@/features/rdvsp/abilities/synchroniser-organisations/implementations/synchroniser-organisations.binding'
import { synchroniserLesRdvsAvec } from '@/features/rdvsp/abilities/synchroniser-rdvs/implementations/synchroniser-rdvs.binding'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { fromResult } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const declencher = declencherSynchronisationAvec(
  synchroniserCompteAvec(
    synchroniserLesOrganisations,
    synchroniserLesRdvsAvec(
      creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding,
    ),
  ),
)

/**
 * Rattrape les rendez-vous des organisations sans webhook, puis relit la
 * projection de l'accueil.
 *
 * Deux abilities sont composées ici, et non l'une dans l'autre : c'est l'écran
 * qui a besoin des deux, pas la synchronisation qui a besoin du widget (IS-1).
 * La projection est celle du rendu initial — une seule forme de part et d'autre,
 * l'union des trois états comprise : la passe peut faire basculer le compte en
 * alerte, et l'écran doit pouvoir le montrer.
 */
const consulter = consulterRdvsAccueil({
  compteDuMediateur,
  lireDonnees: lireDonneesAccueilRdv,
})

export const rafraichirAccueilRdvAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
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
        // de la projection est épargnée.
        if (synchronisation.data.derive === 0) {
          return success<RafraichissementAccueil>({ _tag: 'inchange' })
        }

        return success<RafraichissementAccueil>({
          _tag: 'rafraichi',
          derive: synchronisation.data.derive,
          widget: await consulter({ utilisateurId, maintenant: new Date() }),
        })
      },
      { onError: DECLENCHER_SYNCHRONISATION_ERRORS },
    ),
  )
