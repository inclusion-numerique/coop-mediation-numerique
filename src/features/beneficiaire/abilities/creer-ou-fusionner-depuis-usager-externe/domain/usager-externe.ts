import type { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import type { Email } from '@/features/beneficiaire/domain/email'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@/features/beneficiaire/domain/nom'
import type { Prenom } from '@/features/beneficiaire/domain/prenom'
import type { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import type { Telephone } from '@/libraries/telephone'

export type UsagerExterneAFusionner = {
  readonly rdvUserId: number
  readonly nom: string | null
  readonly prenom: string | null
  readonly telephone: string | null
  readonly email: string | null
  readonly adresse: string | null
  readonly birthDate: Date | null
}

export type MergedBeneficiaire = {
  readonly id: string
  readonly nom: string | null
  readonly prenom: string | null
  readonly email: string | null
  readonly telephone: string | null
  readonly mediateurId: string
  readonly adresse: string | null
  readonly anneeNaissance: number | null
  readonly commune: string | null
}

export type CommuneFields = {
  readonly commune: string
  readonly communeCodePostal: string
  readonly communeCodeInsee: string
}

export type UsagerNormalise = {
  readonly rdvUserId: number
  readonly nom: Nom | null
  readonly prenom: Prenom | null
  readonly telephone: Telephone | null
  readonly email: Email | null
  readonly adresse: string | null
  readonly anneeNaissance: AnneeNaissance | null
}

export type DonneesDeFusion = {
  readonly rdvUserId?: number
  readonly email?: Email
  readonly telephone?: Telephone
  readonly prenom?: Prenom
  readonly nom?: Nom
  readonly adresse?: string
  readonly anneeNaissance?: AnneeNaissance
  readonly trancheAge?: TrancheAge | null
  readonly commune?: string
  readonly communeCodePostal?: string
  readonly communeCodeInsee?: string
}

export type NouveauBeneficiaire = {
  readonly rdvUserId: number
  readonly nom: Nom
  readonly prenom: Prenom
  readonly telephone: Telephone | null
  readonly email: Email | null
  readonly adresse: string | null
  readonly anneeNaissance: AnneeNaissance | null
  readonly trancheAge: TrancheAge | null
  readonly commune: string | null
  readonly communeCodePostal: string | null
  readonly communeCodeInsee: string | null
  readonly mediateurId: MediateurId
}
