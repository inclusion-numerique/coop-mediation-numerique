import { sansDoublons, triee } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { type Anomalie, anomalie } from './anomalie'
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

const rangee = (valeurs: readonly string[]): readonly string[] =>
  triee(sansDoublons([...valeurs]))

export const listeARanger = (
  lieu: LieuAReprendre,
  colonne: ColonneDeListe,
): boolean => !memeSuite(lieu[colonne], rangee(lieu[colonne]))

export const colonnesARanger = (
  lieu: LieuAReprendre,
): readonly ColonneDeListe[] =>
  LISTES.filter((colonne) => listeARanger(lieu, colonne))

export const listesMesurees = (lieu: LieuAReprendre): readonly Anomalie[] =>
  colonnesARanger(lieu).map((colonne) =>
    anomalie(
      'liste-desordonnee',
      'a-verifier',
      colonne,
      lieu[colonne].join(', '),
    ),
  )

const laissePublieSansTypologie = (lieu: LieuAReprendre): boolean =>
  lieu.publie && lieu.typologies.length === 0

const laissePublieSansService = (lieu: LieuAReprendre): boolean =>
  lieu.publie && lieu.services.length === 0

export const listesObligatoires = (
  lieu: LieuAReprendre,
): readonly Anomalie[] => [
  ...(laissePublieSansTypologie(lieu)
    ? [anomalie('sans-typologie', 'a-verifier', 'typologies', '')]
    : []),
  ...(laissePublieSansService(lieu)
    ? [anomalie('sans-service', 'lieu-ecarte', 'services', '')]
    : []),
]
