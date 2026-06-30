import type { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import type { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import type { Email } from '@app/web/features/beneficiaire/domain/email'
import type { Nom } from '@app/web/features/beneficiaire/domain/nom'
import type { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import type { Telephone } from '@app/web/features/beneficiaire/domain/telephone'

export type DuplicateBeneficiaire = {
  readonly id: BeneficiaireId
  readonly nom: Nom | null
  readonly prenom: Prenom | null
  readonly telephone: Telephone | null
  readonly email: Email | null
  readonly creation: Date
  readonly anneeNaissance: AnneeNaissance | null
  readonly communeResidence: CommuneResidence | null
}

type DoublonEntry = {
  readonly id: BeneficiaireId
  readonly nom: Nom
  readonly prenom: Prenom
  readonly telephone: Telephone
  readonly email: Email
  readonly creation: Date
}

export type BeneficiaireDoublon = {
  readonly id: string
  readonly a: DoublonEntry
  readonly b: DoublonEntry
}
