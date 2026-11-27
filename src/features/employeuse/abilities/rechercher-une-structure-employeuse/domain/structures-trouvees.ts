import type { Siret } from '@/libraries/insee'
import type { Employeuse } from '../../../domain/employeuse'

export type EmployeuseAvecSiret = Employeuse & { readonly siret: Siret }

export type StructureTrouvee<Annuaire> =
  | { readonly _tag: 'DeLaCoop'; readonly employeuse: EmployeuseAvecSiret }
  | { readonly _tag: 'DeLAnnuaire'; readonly etablissement: Annuaire }

export type StructuresTrouvees<Annuaire> = {
  readonly structures: readonly StructureTrouvee<Annuaire>[]
  readonly totalCount: number
  readonly moreResults: number
  readonly apiUnavailable: boolean
}
