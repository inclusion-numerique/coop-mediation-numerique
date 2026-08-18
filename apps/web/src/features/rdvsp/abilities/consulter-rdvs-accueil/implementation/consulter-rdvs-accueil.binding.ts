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
