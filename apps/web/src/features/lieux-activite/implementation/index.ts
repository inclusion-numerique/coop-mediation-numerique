/**
 * Ce que la feature choisit pour se réaliser, une dépendance par dossier.
 *
 * `prisma/` porte tout ce qui parle à la base : les transferts, les projections
 * de lecture et le vocabulaire sous lequel elle stocke les nomenclatures. Un
 * autre stockage, ou une autre source, prendra un dossier voisin plutôt que de
 * s'y mêler.
 */
export { lieuFromDomain, lieuToDomain } from './prisma/lieu.transfer'
export {
  type Correle,
  type LieuAMaterialiser,
  lieuCorrele,
  preparerCorrele,
} from './prisma/lieu-correle'
export {
  type LieuEnListe,
  lieuxEnListeDuMediateur,
  projectionDuLieuEnListe,
} from './prisma/lieu-en-liste'
export {
  rattachementFromDomain,
  rattachementToDomain,
} from './prisma/rattachement.transfer'
export {
  type ColonnesDuRegistre,
  colonnesRapporteesParLaCartographie,
  ecrireAuRegistre,
  ecrireLeLieuAuRegistre,
  identiteDuLieu,
  inscriptionPourLIdentifiantCarto,
  lieuVersRegistre,
  retirerDuRegistre,
  toutesLesColonnes,
} from './prisma/registre'
