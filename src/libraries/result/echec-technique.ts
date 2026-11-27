export type EchecTechnique = {
  readonly _tag: 'EchecTechnique'
  readonly cause: string
}

export const EchecTechnique = (cause: string): EchecTechnique => ({
  _tag: 'EchecTechnique',
  cause,
})

export const messageDe = (erreur: unknown): string =>
  erreur instanceof Error ? erreur.message : String(erreur)

export const enEchecTechnique = (erreur: unknown): EchecTechnique =>
  EchecTechnique(messageDe(erreur))
