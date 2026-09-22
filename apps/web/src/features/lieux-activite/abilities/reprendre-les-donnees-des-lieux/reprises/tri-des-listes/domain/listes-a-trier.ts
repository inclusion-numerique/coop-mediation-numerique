import { sansDoublons, triee } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuAReprendre } from '../../../domain'

export const LISTES = [
  'typologies',
  'services',
  'modalitesAcces',
  'modalitesAccompagnement',
  'publicsSpecifiquementAdresses',
  'priseEnChargeSpecifique',
  'fraisACharge',
  'itinerance',
  'dispositifProgrammesNationaux',
  'formationsLabels',
  'autresFormationsLabels',
] as const satisfies readonly (keyof LieuAReprendre)[]

export type ColonneDeListe = (typeof LISTES)[number]

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
