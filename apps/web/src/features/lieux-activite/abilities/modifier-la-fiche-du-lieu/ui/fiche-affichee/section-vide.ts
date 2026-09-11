type ValeurDeSection = string | null | undefined | readonly unknown[]

export const aucuneValeur = (valeurs: readonly ValeurDeSection[]): boolean =>
  valeurs.every(
    (valeur) =>
      valeur == null || (Array.isArray(valeur) && valeur.length === 0),
  )
