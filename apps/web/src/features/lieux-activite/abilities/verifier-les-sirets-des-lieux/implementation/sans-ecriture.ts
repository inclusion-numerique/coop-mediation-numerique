import type { EffacerLeSiret, MarquerLeSiretVerifie } from '../domain'

const neRienEcrire = async (): Promise<void> => undefined

/**
 * Les ports d'écriture d'une passe à blanc : la vérification se déroule en
 * entier, le compte est celui qu'on obtiendrait, et aucun SIRET ne bouge.
 */
export const sansEcriture: {
  readonly effacerLeSiret: EffacerLeSiret
  readonly marquerLeSiretVerifie: MarquerLeSiretVerifie
} = {
  effacerLeSiret: neRienEcrire,
  marquerLeSiretVerifie: neRienEcrire,
}
