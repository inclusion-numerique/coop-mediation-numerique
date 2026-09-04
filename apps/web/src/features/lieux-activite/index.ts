/**
 * API publique de la feature — la part serveur.
 *
 * Ce que les autres features ont le droit de connaître des lieux d'activité :
 * les opérations, les contrats d'entrée, les erreurs qu'elles nomment et les
 * identifiants qui les désignent. Tout le reste est intérieur.
 *
 * Les composants vivent à part, dans `./ui` : ce fichier est chargé côté
 * serveur — par les commandes, les steps Cucumber, les jobs — et y réexporter
 * du React y ferait entrer des feuilles de style et le client Prisma dans le
 * navigateur. La frontière ne se voit ni au typage ni aux tests, seulement au
 * build de production.
 *
 * Deux pièces y figurent au titre d'AR-7 — `lieuCorrele` et `rattacherAuLieu`,
 * que leurs appelants doivent composer dans leur propre transaction, ce qu'un
 * port de commande ne permet pas — et non comme une invitation à interroger la
 * base des lieux.
 */

// Ajouter des lieux depuis la recherche
export {
  type AdresseValidee,
  ajouterDesLieuxActivite,
  type CartoStructure,
  depuisLePanier,
  type LieuACreer,
  type LieuDejaRattache,
  type LieuDemande,
  type LieuExistant,
  lireLieuxDejaRattaches,
  rattacherAuLieu,
  trouverStructuresCarto,
} from './abilities/ajouter-des-lieux-activite'
export { AJOUTER_DES_LIEUX_ACTIVITE_ERRORS } from './abilities/ajouter-des-lieux-activite/action/ajouter-des-lieux-activite.errors'
export { LieuxAAjouterValidation } from './abilities/ajouter-des-lieux-activite/action/ajouter-des-lieux-activite.validation'
export { findCartoStructuresByIds } from './abilities/ajouter-des-lieux-activite/implementation/entrepot/structures-carto'
export {
  type LieuActiviteSearchResult,
  searchLieuActiviteCombined,
} from './abilities/ajouter-des-lieux-activite/implementation/searchLieuActiviteCombined'
// Créer un lieu à la main
export { creerLieuActivite } from './abilities/creer-lieu-activite'
export { CREER_LIEU_ACTIVITE_ERRORS } from './abilities/creer-lieu-activite/action/creer-lieu-activite.errors'
export { nouveauLieu } from './abilities/creer-lieu-activite/action/depuis-la-saisie'
// Fusionner deux lieux
export {
  apercuDeLaFusion,
  type ChampsPartageables,
  type FusionApercue,
  fusionnerDesLieux,
  type LieuAFusionner,
  type LieuTrouve,
  lieuAFusionner,
  lieuxAFusionner,
} from './abilities/fusionner-des-lieux'
export { FusionnerDesLieuxValidation } from './abilities/fusionner-des-lieux/action/fusionner-des-lieux.validation'
// Servir les lieux aux clients d'API
export {
  inventaireDesLieux,
  type LieuInventorie,
} from './abilities/inventorier-les-lieux'
// Lister
export {
  communesDesLieux,
  type LieuxDuDepartement,
  lieuxDuDepartement,
  type RechercheDeLieuxDuDepartement,
} from './abilities/lister-les-lieux-du-departement'
export {
  getCommunesAndDepartementsOptions,
  getLieuxActiviteOptions,
  getMediateurCommunesAndDepartementsOptions,
  getMediateursLieuxActiviteOptions,
  type LieuActiviteOption,
  mediateurStructureSelect,
  optionDeLieu,
} from './abilities/lister-les-options-de-lieux'
export {
  listerMesLieuxActivite,
  type MonLieuActivite,
  TriDesLieux,
} from './abilities/lister-mes-lieux-activite'
export {
  type LieuDeLaListe,
  rechercherDesLieux,
} from './abilities/lister-tous-les-lieux'
// Modifier la fiche
export {
  consulterLaFicheDuLieu,
  type FicheDuLieu,
  type ModificationLieu,
  modifierLaFicheDuLieu,
  type SectionDeLaFiche,
} from './abilities/modifier-la-fiche-du-lieu'
export { depuisLaSaisie } from './abilities/modifier-la-fiche-du-lieu/action/depuis-la-saisie'
export { MODIFIER_LA_FICHE_DU_LIEU_ERRORS } from './abilities/modifier-la-fiche-du-lieu/action/modifier-la-fiche-du-lieu.errors'
export { ModifierLaFicheDuLieuValidation } from './abilities/modifier-la-fiche-du-lieu/action/modifier-la-fiche-du-lieu.validation'
export { type Aidant, lieuxPublies } from './abilities/publier-les-lieux'
export {
  type LieuActiviteTrouve,
  rechercherUnLieuActivite,
} from './abilities/rechercher-un-lieu-activite'
// Réconcilier avec la cartographie nationale
export {
  appliquerLaReconciliation,
  lireLesLieuxCarto,
  reconcilierAvecLaCartographie,
} from './abilities/reconcilier-avec-la-cartographie'
// Retirer
export { retirerDesLieux } from './abilities/retirer-des-lieux'
export {
  type AuteurDuRetrait,
  retirerUnMediateurDuLieu,
} from './abilities/retirer-un-mediateur-du-lieu'
export { RETIRER_UN_MEDIATEUR_DU_LIEU_ERRORS } from './abilities/retirer-un-mediateur-du-lieu/action/retirer-un-mediateur-du-lieu.errors'
export { RetirerUnMediateurDuLieuValidation } from './abilities/retirer-un-mediateur-du-lieu/action/retirer-un-mediateur-du-lieu.validation'
// Vérifier les SIRET contre l'annuaire des entreprises
export {
  type Compte,
  effacerLeSiret,
  interrogerSirene,
  lireLesLieuxASiret,
  marquerLeSiretVerifie,
  sansEcriture,
  verifierLesSiretsDesLieux,
} from './abilities/verifier-les-sirets-des-lieux'
// Lectures partagées
export {
  type Correle,
  type LieuAMaterialiser,
  lieuCorrele,
  preparerCorrele,
} from './db/lieu-correle'
export {
  type LieuEnListe,
  lieuxEnListeDuMediateur,
  projectionDuLieuEnListe,
} from './db/lieu-en-liste'
export {
  type LieuDuMediateur,
  lieuxActiviteDuMediateur,
  visibiliteDesLieuxDuMediateur,
} from './db/lieux-du-mediateur'
// Identité d'un lieu et des personnes qui le manipulent
export { LieuId } from './domain/lieu-id'
export { MediateurId } from './domain/mediateur-id'
export { UserId } from './domain/user-id'
// Ce qui se saisit pour un lieu
export {
  type CreerLieuActiviteData,
  CreerLieuActiviteValidation,
} from './formulaire/CreerLieuActiviteValidation'
