/**
 * L'écriture au registre des lieux de l'Entrepôt (`main.lieu_inclusion_registre`).
 *
 * Elle vit sous `prisma/` et non dans un dossier voisin parce qu'elle emprunte
 * la même dépendance : `main` et `coop` sont deux schémas d'une seule base,
 * atteints par un seul client, ce qui permet aux deux écritures de tenir dans la
 * même transaction. Le jour où l'Entrepôt s'éloigne, c'est ce dossier qui part.
 */

export {
  ecrireAuRegistre,
  ecrireLeLieuAuRegistre,
  retirerDuRegistre,
  toutesLesColonnes,
} from './ecrire-au-registre'
export { avecIdentifiantCarto } from './identifiants-carto'
export {
  type ColonnesDuRegistre,
  lieuVersRegistre,
} from './lieu.registre.transfer'
