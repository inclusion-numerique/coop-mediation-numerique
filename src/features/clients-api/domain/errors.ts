export type ClientApiIntrouvable = {
  readonly _tag: 'ClientApiIntrouvable'
}

export const ClientApiIntrouvable = (): ClientApiIntrouvable => ({
  _tag: 'ClientApiIntrouvable',
})

export type NomDejaPris = {
  readonly _tag: 'NomDejaPris'
  readonly nom: string
}

export const NomDejaPris = (nom: string): NomDejaPris => ({
  _tag: 'NomDejaPris',
  nom,
})
