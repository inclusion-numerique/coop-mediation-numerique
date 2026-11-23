import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { Email } from '@/features/beneficiaire/domain/email'
import type { Nom } from '@/features/beneficiaire/domain/nom'
import type { Prenom } from '@/features/beneficiaire/domain/prenom'
import type { Telephone } from '@/libraries/telephone'

// Projection partagée au niveau feature (voir beneficiaire/db).
export type { DuplicateBeneficiaire } from '@/features/beneficiaire/db/duplicate-beneficiaire'

type DoublonEntry = {
  readonly id: BeneficiaireId
  readonly nom: Nom
  readonly prenom: Prenom
  readonly telephone: Telephone | null
  readonly email: Email | null
  readonly creation: Date
}

export type BeneficiaireDoublon = {
  readonly id: string
  readonly a: DoublonEntry
  readonly b: DoublonEntry
}
