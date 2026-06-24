import type { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import type { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import type { Email } from '@app/web/features/beneficiaire/domain/email'
import type { Genre } from '@app/web/features/beneficiaire/domain/genre'
import type { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@app/web/features/beneficiaire/domain/nom'
import type { Notes } from '@app/web/features/beneficiaire/domain/notes'
import type { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import type { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'
import type { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import type { TrancheAge } from '@app/web/features/beneficiaire/domain/tranche-age'
import type { Page, PageSize, Paginated, Search, Sort } from '@arckit/resultset'

export type BeneficiaireListItem = {
  readonly id: BeneficiaireId
  readonly mediateurId: MediateurId
  readonly prenom: Prenom
  readonly nom: Nom
  readonly telephone: Telephone | null
  readonly email: Email | null
  readonly anneeNaissance: AnneeNaissance | null
  readonly trancheAge: TrancheAge
  readonly genre: Genre
  readonly statutSocial: StatutSocial
  readonly communeResidence: CommuneResidence | null
  readonly creation: Date
  readonly accompagnementsCount: number
  readonly notes: Notes | null
}

export const beneficiaireSortFields = [
  'nom',
  'prenom',
  'anneeNaissance',
  'accompagnementsCount',
] as const

export type BeneficiaireSortField = (typeof beneficiaireSortFields)[number]

export type ListerBeneficiaires = (input: {
  mediateurId: MediateurId
  search?: Search
  page?: Page
  pageSize?: PageSize
  sort?: Sort<BeneficiaireSortField>
  excludeIds?: readonly BeneficiaireId[]
}) => Promise<Paginated<BeneficiaireListItem>>
