/**
 * Un lieu de la cartographie nationale, tel que l'Entrepôt le décrit.
 *
 * `identifiantCartographie` est un identifiant **composite** : quand plusieurs
 * sources décrivent le même endroit, la cartographie concatène leurs
 * identifiants. Les tokens de la coop y portent le préfixe
 * `Coop-numérique_`, suivi de l'identifiant du lieu chez nous.
 */
export type LieuCarto = {
  readonly identifiantCartographie: string
  readonly source: string | null
  readonly dateMaj: Date | null
}

/**
 * Les lieux de la coop que la cartographie a réunis sous un même identifiant.
 * Le premier survit à la fusion, les suivants lui cèdent leurs rattachements.
 */
export type LieuxCoopReunis = {
  readonly identifiantCartographie: string
  readonly source: string | null
  readonly dateMaj: Date | null
  readonly coopIds: readonly string[]
}

export const PREFIXE_COOP = 'Coop-numérique_'
const SEPARATEUR = '__'

/** Les identifiants coop portés par un identifiant composite, sans doublon. */
export const identifiantsCoop = (
  identifiantCartographie: string,
): readonly string[] =>
  Array.from(
    new Set(
      identifiantCartographie
        .split(SEPARATEUR)
        .filter((token) => token.startsWith(PREFIXE_COOP))
        .map((token) => token.slice(PREFIXE_COOP.length)),
    ),
  )

/**
 * Les lieux carto qui désignent au moins un lieu de la coop, regroupés. Ceux
 * qu'aucun token coop ne concerne sont écartés : la coop n'a rien à y relier.
 */
export const lieuxCoopReunis = (
  lieux: readonly LieuCarto[],
): readonly LieuxCoopReunis[] =>
  lieux.flatMap((lieu) => {
    const coopIds = identifiantsCoop(lieu.identifiantCartographie)

    return coopIds.length === 0 ? [] : [{ ...lieu, coopIds }]
  })
