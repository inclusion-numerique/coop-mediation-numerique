import {
  ADRESSE_SIMILARITY_THRESHOLD,
  diceSimilarity,
  NOM_SIMILARITY_THRESHOLD,
} from '@app/web/libraries/siret'
import type { LieuAVerifier, ReponseSirene } from './lieu-a-verifier'

/** L'issue de l'examen d'un lieu. */
export type Verdict = 'ignore' | 'verifie' | 'efface' | 'echec'

/**
 * Un lieu confronté à SIRENE depuis peu n'est pas reconfronté : l'annuaire des
 * entreprises bouge lentement et chaque interrogation coûte un appel réseau.
 */
export const dejaVerifie = (
  { synchronisation }: LieuAVerifier,
  depuis: Date,
): boolean => synchronisation != null && synchronisation > depuis

/**
 * Le SIRET désigne bien ce lieu si le nom ET l'adresse enregistrés à SIRENE
 * ressemblent assez à ceux du lieu. Il suffit que l'un des deux diverge pour
 * que le numéro soit tenu pour erroné — et un numéro erroné vaut moins que pas
 * de numéro, puisqu'il désigne un autre établissement.
 *
 * La comparaison est floue : le lieu s'appelle « Maison France Services de
 * Reims » là où SIRENE dit « COMMUNE DE REIMS », et les deux graphies d'une
 * même adresse ne coïncident jamais au caractère près.
 */
export const verdictDuSiret = (
  lieu: LieuAVerifier,
  reponse: ReponseSirene,
): 'verifie' | 'efface' =>
  reponse.connu &&
  diceSimilarity(lieu.nom, reponse.nom) >= NOM_SIMILARITY_THRESHOLD &&
  diceSimilarity(lieu.adresse, reponse.adresse) >= ADRESSE_SIMILARITY_THRESHOLD
    ? 'verifie'
    : 'efface'
