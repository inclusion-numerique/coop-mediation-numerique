export type StatutDeConseillerNumerique =
  | { readonly _tag: 'CompteInconnu' }
  | { readonly _tag: 'EnPoste' }
  | { readonly _tag: 'HorsPoste' }
