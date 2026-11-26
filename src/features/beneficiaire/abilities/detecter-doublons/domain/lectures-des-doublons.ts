import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { DuplicateBeneficiaire } from '@/features/beneficiaire/domain/doublon-de-beneficiaire'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { BeneficiaireDoublon } from './beneficiaire-doublon'

export type DetecterLesDoublons = (input: {
  beneficiaireId: BeneficiaireId
  mediateurId: MediateurId
}) => Promise<DuplicateBeneficiaire[]>

export type DetecterDoublons = (input: {
  mediateurId: MediateurId
  fuzzyMatching?: boolean
}) => Promise<{ count: number; duplicates: BeneficiaireDoublon[] }>
