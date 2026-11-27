import type { Commune } from '../commune'

export type CommuneComptee =
  | { readonly type: 'Renseignee'; readonly commune: Commune }
  | { readonly type: 'NonCommuniquee' }
