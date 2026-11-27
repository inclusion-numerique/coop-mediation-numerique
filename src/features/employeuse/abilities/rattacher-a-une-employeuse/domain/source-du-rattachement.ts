import type { Siret } from '@/libraries/insee'
import type { IdentiteEmployeuse } from '../../../domain/identite-employeuse'

export type SourceDuRattachement =
  | {
      readonly _tag: 'Saisie'
      readonly identite: IdentiteEmployeuse | null
    }
  | { readonly _tag: 'Siret'; readonly siret: Siret }
  | { readonly _tag: 'ProConnect'; readonly siret: Siret | null }
