import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import type { Email } from '@app/web/features/beneficiaire/domain/email'
import type { Nom } from '@app/web/features/beneficiaire/domain/nom'
import type { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import type { Telephone } from '@app/web/features/beneficiaire/domain/telephone'

// Projection partagée au niveau feature (voir beneficiaire/db).
export type { DuplicateBeneficiaire } from '@app/web/features/beneficiaire/db/duplicate-beneficiaire'

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
