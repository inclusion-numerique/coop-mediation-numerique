import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import type { Email } from '@app/web/features/beneficiaire/domain/email'
import type { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@app/web/features/beneficiaire/domain/nom'
import type { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import type { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
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

export type DetecterDoublons = (input: {
  mediateurId: MediateurId
  fuzzyMatching?: boolean
}) => Promise<{ count: number; duplicates: BeneficiaireDoublon[] }>
