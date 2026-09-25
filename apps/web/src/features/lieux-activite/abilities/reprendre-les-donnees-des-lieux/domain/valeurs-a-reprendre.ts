import { sansDoublons, triee } from '@gouvfr-anct/lieux-de-mediation-numerique'

export type ValeursAReprendre = {
  readonly conservees: readonly string[]
  readonly perdues: readonly string[]
  readonly rienQueLOrdre: boolean
}

export type Nettoyer = (valeur: string) => readonly string[]

const memeSuite = (
  gauche: readonly string[],
  droite: readonly string[],
): boolean => gauche.join('\u0000') === droite.join('\u0000')

const memesValeurs = (
  gauche: readonly string[],
  droite: readonly string[],
): boolean => memeSuite(triee(sansDoublons([...gauche])), droite)

const rangees = (valeurs: readonly string[]): readonly string[] =>
  triee(sansDoublons([...valeurs]))

export const valeursAReprendre = (
  valeurs: readonly string[],
  nettoyer: Nettoyer,
): ValeursAReprendre | null => {
  const conservees = rangees(valeurs.flatMap(nettoyer))

  if (memeSuite(valeurs, conservees)) return null

  return {
    conservees,
    perdues: valeurs.filter((valeur) => nettoyer(valeur).length === 0),
    rienQueLOrdre: memesValeurs(valeurs, conservees),
  }
}
