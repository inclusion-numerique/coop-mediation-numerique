import { sansDoublons, triee } from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  type ColonneDeListe,
  LISTES,
  type LieuAReprendre,
} from './lieu-a-reprendre'

const SEPARATEUR = '\u0000'

const memeSuite = (
  gauche: readonly string[],
  droite: readonly string[],
): boolean => gauche.join(SEPARATEUR) === droite.join(SEPARATEUR)

const triees = (valeurs: readonly string[]): readonly string[] =>
  triee(sansDoublons([...valeurs]))

export const listeATrier = (
  lieu: LieuAReprendre,
  colonne: ColonneDeListe,
): boolean => !memeSuite(lieu[colonne], triees(lieu[colonne]))

export const colonnesATrier = (
  lieu: LieuAReprendre,
): readonly ColonneDeListe[] =>
  LISTES.filter((colonne) => listeATrier(lieu, colonne))
