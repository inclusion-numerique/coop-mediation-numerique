/**
 * L'écriture au registre des lieux de l'Entrepôt (`main.lieu_inclusion`).
 *
 * Elle vit sous `prisma/` et non dans un dossier voisin parce qu'elle emprunte
 * la même dépendance : `main` et `coop` sont deux schémas d'une seule base,
 * atteints par un seul client, ce qui permet aux deux écritures de tenir dans la
 * même transaction. Le jour où l'Entrepôt s'éloigne, c'est ce dossier qui part.
 */

export {
  type ChampsDAffichage,
  champsDAffichage,
} from './champs-d-affichage'
export {
  type ColonnesAEcrire,
  colonnesRapporteesParLaCartographie,
  identiteDuLieu,
  toutesLesColonnes,
} from './colonnes-a-ecrire'
export { contactDuRegistre } from './contact-du-registre'
export { aBougeDepuis, derniereEcriture } from './derniere-ecriture'
export { ecrireAuRegistre, ecrireLeLieuAuRegistre } from './ecrire-au-registre'
export {
  adresseDeLInscription,
  ficheDuRegistre,
  type InscriptionPourLaFiche,
  inscriptionPourLaFiche,
} from './fiche-du-registre'
export {
  avecIdentifiantCarto,
  inscriptionPourLIdentifiantCarto,
  lieuCoopPorteurDeLaCarto,
} from './identifiants-carto'
export {
  type ColonnesDuRegistre,
  lieuVersRegistre,
} from './lieu.registre.transfer'
export { derniereModificationExterne } from './modification-du-registre'
export { retirerDuRegistre } from './retirer-du-registre'
