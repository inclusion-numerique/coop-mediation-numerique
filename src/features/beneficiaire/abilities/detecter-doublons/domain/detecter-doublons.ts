import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { Email } from '@/features/beneficiaire/domain/email'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@/features/beneficiaire/domain/nom'
import type { Prenom } from '@/features/beneficiaire/domain/prenom'
import type { Telephone } from '@/features/beneficiaire/domain/telephone'
import type { BeneficiaireDoublon, DuplicateBeneficiaire } from './types'

export type FindDuplicatesForBeneficiaire = (input: {
  beneficiaire: {
    id: BeneficiaireId | null
    nom: Nom | null
    prenom: Prenom | null
    telephone: Telephone | null
    email: Email | null
    mediateurId: MediateurId
  }
  withConflictingFields: 'include' | 'exclude'
  fuzzyMatching?: boolean
}) => Promise<DuplicateBeneficiaire[]>

/**
 * Détection des doublons d'un bénéficiaire déjà persisté, depuis son seul id :
 * l'ability lit elle-même son identité (owner-scopée) et la brande, pour qu'un
 * hub appelant n'ait qu'à fournir des identifiants. Sert l'alerte « doublon
 * potentiel » de la fiche de consultation.
 */
export type FindDuplicatesForBeneficiaireById = (input: {
  beneficiaireId: BeneficiaireId
  mediateurId: MediateurId
}) => Promise<DuplicateBeneficiaire[]>

export type DetecterDoublons = (input: {
  mediateurId: MediateurId
  fuzzyMatching?: boolean
}) => Promise<{ count: number; duplicates: BeneficiaireDoublon[] }>
