import type { IdentiteEmployeuse } from '../../../domain/identite-employeuse'

export type EtablissementSirene =
  | { readonly _tag: 'Ferme' }
  | { readonly _tag: 'Ouvert'; readonly identite: IdentiteEmployeuse | null }
