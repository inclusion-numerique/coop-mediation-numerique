import type { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { Email } from '@/features/beneficiaire/domain/email'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@/features/beneficiaire/domain/nom'
import type { Prenom } from '@/features/beneficiaire/domain/prenom'
import type { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import type { Telephone } from '@/libraries/telephone'
import type { RdvUserId } from './rdv-user-id'

export type MergedBeneficiaire = {
  readonly id: BeneficiaireId
  readonly nom: Nom | null
  readonly prenom: Prenom | null
  readonly email: Email | null
  readonly telephone: Telephone | null
  readonly mediateurId: MediateurId
  readonly adresse: string | null
  readonly anneeNaissance: AnneeNaissance | null
  readonly commune: CommuneResidence['commune'] | null
}

export type IdentiteConnue = Pick<
  MergedBeneficiaire,
  'email' | 'telephone' | 'prenom' | 'nom' | 'anneeNaissance'
>

export type UsagerNormalise = {
  readonly rdvUserId: RdvUserId
  readonly nom: Nom | null
  readonly prenom: Prenom | null
  readonly telephone: Telephone | null
  readonly email: Email | null
  readonly adresse: string | null
  readonly anneeNaissance: AnneeNaissance | null
}

export type DonneesDeFusion = {
  readonly rdvUserId?: RdvUserId
  readonly email?: Email
  readonly telephone?: Telephone
  readonly prenom?: Prenom
  readonly nom?: Nom
  readonly adresse?: string
  readonly anneeNaissance?: AnneeNaissance
  readonly trancheAge?: TrancheAge | null
  readonly commune?: CommuneResidence['commune']
  readonly communeCodePostal?: CommuneResidence['codePostal']
  readonly communeCodeInsee?: CommuneResidence['codeInsee']
}

export type NouveauBeneficiaire = {
  readonly rdvUserId: RdvUserId
  readonly nom: Nom
  readonly prenom: Prenom
  readonly telephone: Telephone | null
  readonly email: Email | null
  readonly adresse: string | null
  readonly anneeNaissance: AnneeNaissance | null
  readonly trancheAge: TrancheAge | null
  readonly commune: CommuneResidence['commune'] | null
  readonly communeCodePostal: CommuneResidence['codePostal'] | null
  readonly communeCodeInsee: CommuneResidence['codeInsee'] | null
  readonly mediateurId: MediateurId
}
