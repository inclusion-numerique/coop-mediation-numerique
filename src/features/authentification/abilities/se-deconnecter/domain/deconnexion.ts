export type Deconnexion =
  | { readonly _tag: 'AupresDeProConnect'; readonly idTokenHint: string }
  | { readonly _tag: 'Locale' }
