import { preparerUrlCreationCra } from './activite/preparer-url-creation-cra.adapter'
import { creerOuFusionnerBeneficiaires } from './beneficiaire/creer-ou-fusionner-beneficiaires.adapter'
import { creerActiviteDepuisRdv } from './creer-activite-depuis-rdv'
import { compteDuRedacteur } from './prisma/compte-du-redacteur.query'
import { lireRdvPourActivite } from './prisma/lire-rdv-pour-activite.query'

/**
 * Composition de l'ability avec ses adaptateurs réels, partagée par la server
 * action et les scénarios Cucumber : recopiée aux deux endroits, elle divergerait
 * le jour où une dépendance change.
 *
 * À importer par ce chemin explicite : le module tire Prisma, qu'un composant
 * client ne doit jamais embarquer.
 */
export const creerActiviteDepuisRdvBinding = creerActiviteDepuisRdv({
  lireRdv: lireRdvPourActivite,
  compteDuRedacteur,
  creerOuFusionnerBeneficiaires,
  preparerUrlCreationCra,
})
