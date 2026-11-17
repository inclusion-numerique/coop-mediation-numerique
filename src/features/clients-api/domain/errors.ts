export type ClientApiIntrouvable = {
  readonly _tag: 'ClientApiIntrouvable'
  readonly clientApiId: string
}

export const ClientApiIntrouvable = (
  clientApiId: string,
): ClientApiIntrouvable => ({ _tag: 'ClientApiIntrouvable', clientApiId })

export type NomDejaPris = {
  readonly _tag: 'NomDejaPris'
  readonly nom: string
}

export const NomDejaPris = (nom: string): NomDejaPris => ({
  _tag: 'NomDejaPris',
  nom,
})
