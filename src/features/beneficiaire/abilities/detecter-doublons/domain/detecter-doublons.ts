import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { DuplicateBeneficiaire } from '@/features/beneficiaire/domain/doublon-de-beneficiaire'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { BeneficiaireDoublon } from './types'

/**
 * Détection des doublons d'un bénéficiaire déjà persisté, depuis son seul id :
 * l'ability lit elle-même son identité (owner-scopée) et la brande, pour qu'un
 * hub appelant n'ait qu'à fournir des identifiants. Sert l'alerte « doublon
 * potentiel » de la fiche de consultation.
 */
export type DetecterLesDoublons = (input: {
  beneficiaireId: BeneficiaireId
  mediateurId: MediateurId
}) => Promise<DuplicateBeneficiaire[]>

export type DetecterDoublons = (input: {
  mediateurId: MediateurId
  fuzzyMatching?: boolean
}) => Promise<{ count: number; duplicates: BeneficiaireDoublon[] }>
