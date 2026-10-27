import type { Precision } from './precision'

export type Choix<Valeur> =
  | { readonly _tag: 'Liste'; readonly valeur: Valeur }
  | { readonly _tag: 'Autre'; readonly precision: Precision | null }
