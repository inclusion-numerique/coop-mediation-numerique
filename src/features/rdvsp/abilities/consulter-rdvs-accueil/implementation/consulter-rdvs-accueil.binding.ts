import type { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import {
  synchroniserAuChargement as synchroniserAuChargementDuCompte,
  type WidgetRdvAccueil,
} from '../domain/widget-rdv'
import { consulterRdvsAccueil } from './consulter-rdvs-accueil'
import { compteDuMediateur } from './prisma/compte-du-mediateur.query'
import { lireDonneesAccueilRdv } from './prisma/donnees-accueil-rdv.query'

/**
 * Composition de l'ability avec ses adaptateurs réels.
 *
 * Elle vit ici plutôt que dans chaque appelant : le rendu initial de l'accueil et
 * la passe de rattrapage consultent la même projection, et la recopier faisait
 * déjà diverger le jour où l'on change une dépendance.
 *
 * À importer par ce chemin explicite : le module tire Prisma, qu'un composant
 * client ne doit jamais embarquer.
 */
export const consulterRdvsAccueilBinding = consulterRdvsAccueil({
  compteDuMediateur,
  lireDonnees: lireDonneesAccueilRdv,
})

/**
 * Le bloc RDV tel que l'accueil l'affiche : la projection, et le drapeau qui dit
 * s'il faut rattraper les organisations sans webhook à l'ouverture de la page.
 *
 * Les deux voyagent ensemble parce qu'ils sont lus ensemble, et que l'appelant
 * n'a pas à connaître la notion de compte RDV pour obtenir le second.
 */
export const blocRdvAccueil = async (
  utilisateurId: UtilisateurCoopId,
  maintenant: Date,
): Promise<{
  widget: WidgetRdvAccueil
  synchroniserAuChargement: boolean
}> => {
  const compte = await compteDuMediateur(utilisateurId)

  return {
    widget: await consulterRdvsAccueilBinding({ utilisateurId, maintenant }),
    synchroniserAuChargement:
      compte !== null && synchroniserAuChargementDuCompte(compte),
  }
}
