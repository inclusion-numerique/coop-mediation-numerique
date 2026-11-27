import type { Lieu } from '../../../domain/lieu'
import type { SectionsEnregistrees } from '../../../domain/sections-enregistrees'

export type DifferencesAppliquees =
  | SectionsEnregistrees
  | { readonly _tag: 'SansEcart'; readonly lieu: Lieu }
