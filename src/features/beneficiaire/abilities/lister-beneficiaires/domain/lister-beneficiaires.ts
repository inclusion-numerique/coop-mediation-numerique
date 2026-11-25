import type { Page, PageSize, Paginated, Search, Sort } from '@arckit/resultset'
import type { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { Email } from '@/features/beneficiaire/domain/email'
import type { Genre } from '@/features/beneficiaire/domain/genre'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@/features/beneficiaire/domain/nom'
import type { Notes } from '@/features/beneficiaire/domain/notes'
import type { Prenom } from '@/features/beneficiaire/domain/prenom'
import type { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import type { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import type { Telephone } from '@/libraries/telephone'

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

export const colonnesTriablesDesBeneficiaires = [
  'nom',
  'prenom',
  'anneeNaissance',
  'accompagnementsCount',
] as const

export type ColonneTriableDesBeneficiaires =
  (typeof colonnesTriablesDesBeneficiaires)[number]

export type ListerBeneficiaires = (input: {
  mediateurId: MediateurId
  search?: Search
  page?: Page
  pageSize?: PageSize
  sort?: Sort<ColonneTriableDesBeneficiaires>
  excludeIds?: readonly BeneficiaireId[]
}) => Promise<Paginated<BeneficiaireListItem>>
