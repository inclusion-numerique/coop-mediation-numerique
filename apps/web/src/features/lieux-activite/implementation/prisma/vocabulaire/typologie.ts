import { Typologie } from '@gouvfr-anct/lieux-de-mediation-numerique'

/**
 * La base nomme ses typologies exactement comme le schéma national les
 * valorise : ce sont les mêmes sigles, « Autre » compris.
 *
 * Plutôt qu'une table de 92 lignes qui recopierait le paquet, le type des noms
 * stockés se déduit des valeurs du standard, et la correspondance se fait par
 * égalité. Ce n'est pas une coïncidence sur parole : `ligne-du-lieu` compare
 * ces noms à ceux de la base, et la compilation s'arrête si l'un des deux
 * bouge.
 */
export type TypologieCoop = `${Typologie}`

const parValeur = new Map<string, Typologie>(
  Object.values(Typologie).map((typologie) => [typologie, typologie]),
)

export const typologie = {
  versStandard: (valeur: TypologieCoop): Typologie | null =>
    parValeur.get(valeur) ?? null,
  versCoop: (valeur: Typologie): TypologieCoop => valeur,
}
