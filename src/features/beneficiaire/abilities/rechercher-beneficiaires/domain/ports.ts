import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { BeneficiairesRecherches } from './beneficiaires-recherches'

export type RechercherBeneficiaires = (input: {
  readonly mediateurId: MediateurId
  readonly query: string
  readonly excludeIds?: readonly BeneficiaireId[]
}) => Promise<BeneficiairesRecherches>

export type ProposerDesBeneficiaires = (input: {
  readonly mediateurId: MediateurId
  readonly includeBeneficiaireIds?: readonly BeneficiaireId[]
}) => Promise<BeneficiairesRecherches>
