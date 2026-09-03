/**
 * API publique de la feature : ce que les autres features ont le droit de
 * connaître des lieux d'activité.
 *
 * Deux pièces y figurent au titre d'AR-7 — leurs appelants doivent les composer
 * dans leur propre transaction, ce qu'un port de commande ne permet pas — et non
 * comme une invitation à interroger la base des lieux.
 */

export {
  ajouterDesLieuxActivite,
  type CartoStructure,
  type LieuDemande,
  lireLieuxDejaRattaches,
  rattacherAuLieu,
  trouverStructuresCarto,
} from './abilities/ajouter-des-lieux-activite'
export {
  type Correle,
  type LieuAMaterialiser,
  lieuCorrele,
  preparerCorrele,
} from './db/lieu-correle'
