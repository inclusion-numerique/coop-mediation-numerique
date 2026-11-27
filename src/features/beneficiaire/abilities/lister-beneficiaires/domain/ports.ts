import type { Page, PageSize, Paginated, Search, Sort } from '@arckit/resultset'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type {
  BeneficiaireListItem,
  ColonneTriableDesBeneficiaires,
} from './liste-des-beneficiaires'

export type ListerBeneficiaires = (input: {
  readonly mediateurId: MediateurId
  readonly search?: Search
  readonly page?: Page
  readonly pageSize?: PageSize
  readonly sort?: Sort<ColonneTriableDesBeneficiaires>
  readonly excludeIds?: readonly BeneficiaireId[]
}) => Promise<Paginated<BeneficiaireListItem>>
