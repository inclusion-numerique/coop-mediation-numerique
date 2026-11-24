export { champsDAffichage } from './champs-d-affichage.select'
export {
  colonnesRapporteesParLaCartographie,
  identiteDuLieu,
  toutesLesColonnes,
} from './colonnes-a-ecrire.select'

export { aBougeDepuis, derniereEcriture } from './derniere-ecriture.transfer'
export {
  ecrireAuRegistre,
  ecrireLeLieuAuRegistre,
} from './ecrire-au-registre.mutation'
export {
  adresseDeLInscription,
  inscriptionPourLaFiche,
} from './fiche-du-registre.select'
export {
  avecIdentifiantCarto,
  inscriptionPourLIdentifiantCarto,
  lieuCoopPorteurDeLaCarto,
} from './identifiants-carto.query'
export { type ColonnesDuRegistre } from './lieu.transfer'

export { retirerDuRegistre } from './retirer-du-registre.mutation'
