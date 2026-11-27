import type { NomDuClientApi } from './nom-du-client-api'

export type ClientApiIntrouvable = {
  readonly _tag: 'ClientApiIntrouvable'
}

export const ClientApiIntrouvable = (): ClientApiIntrouvable => ({
  _tag: 'ClientApiIntrouvable',
})

export type NomDejaPris = {
  readonly _tag: 'NomDejaPris'
  readonly nom: NomDuClientApi
}

export const NomDejaPris = (nom: NomDuClientApi): NomDejaPris => ({
  _tag: 'NomDejaPris',
  nom,
})
