import type { Telephone } from './telephone'

export type ContactTelephone =
  | { readonly _tag: 'disponible'; readonly numero: Telephone }
  | { readonly _tag: 'pasDeTelephone' }
  | { readonly _tag: 'nonRenseigne' }
