import type { Courriel } from '../identite/courriel'

export type Prevenance = {
  readonly coordinateur: Courriel
  readonly invite: Courriel
  readonly reponse: 'Acceptee' | 'Refusee'
}
