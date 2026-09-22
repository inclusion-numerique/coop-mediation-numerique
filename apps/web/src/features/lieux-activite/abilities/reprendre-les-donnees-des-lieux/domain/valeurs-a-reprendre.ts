export type ValeursAReprendre = {
  readonly conservees: readonly string[]
  readonly perdues: readonly string[]
}

export type Nettoyer = (valeur: string) => readonly string[]

const memeSuite = (
  gauche: readonly string[],
  droite: readonly string[],
): boolean => gauche.join('\u0000') === droite.join('\u0000')

export const valeursAReprendre = (
  valeurs: readonly string[],
  nettoyer: Nettoyer,
): ValeursAReprendre | null => {
  const conservees = valeurs.flatMap(nettoyer)
  const perdues = valeurs.filter((valeur) => nettoyer(valeur).length === 0)

  return memeSuite(valeurs, conservees) ? null : { conservees, perdues }
}
