import { sansDoublons, triee } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { type ColonneDeListe, LISTES, type LieuATrier } from './lieu-a-trier'

const SEPARATEUR = '\u0000'

const memeSuite = (
  gauche: readonly string[],
  droite: readonly string[],
): boolean => gauche.join(SEPARATEUR) === droite.join(SEPARATEUR)

const triees = (valeurs: readonly string[]): readonly string[] =>
  triee(sansDoublons([...valeurs]))

export const listeATrier = (
  lieu: LieuATrier,
  colonne: ColonneDeListe,
): boolean => !memeSuite(lieu[colonne], triees(lieu[colonne]))

export const colonnesATrier = (lieu: LieuATrier): readonly ColonneDeListe[] =>
  LISTES.filter((colonne) => listeATrier(lieu, colonne))
