/**
 * API publique de la feature : ce que les autres features ont le droit de
 * connaître des lieux d'activité.
 *
 * Deux pièces y figurent au titre d'AR-7 — leurs appelants doivent les composer
 * dans leur propre transaction, ce qu'un port de commande ne permet pas — et non
 * comme une invitation à interroger la base des lieux.
 *
 * `fusionnerDesLieux` y figure pour une autre raison : deux jobs la lancent en
 * masse, et ils ne sont pas encore migrés. Leur propre passage dans la feature
 * la fera rentrer.
 */

export {
  type AdresseValidee,
  ajouterDesLieuxActivite,
  type CartoStructure,
  depuisLePanier,
  type LieuACreer,
  type LieuDemande,
  type LieuExistant,
  lireLieuxDejaRattaches,
  rattacherAuLieu,
  trouverStructuresCarto,
} from './abilities/ajouter-des-lieux-activite'
export { fusionnerDesLieux } from './abilities/fusionner-des-lieux'
export {
  type Correle,
  type LieuAMaterialiser,
  lieuCorrele,
  preparerCorrele,
} from './db/lieu-correle'
