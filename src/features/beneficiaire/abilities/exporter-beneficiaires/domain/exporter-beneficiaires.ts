import type { PageSize, Search } from '@arckit/resultset'
import type { Workbook } from 'exceljs'
import type { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import type { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { Email } from '@/features/beneficiaire/domain/email'
import type { Genre } from '@/features/beneficiaire/domain/genre'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@/features/beneficiaire/domain/nom'
import type { Notes } from '@/features/beneficiaire/domain/notes'
import type { Prenom } from '@/features/beneficiaire/domain/prenom'
import type { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import type { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import type { AuteurDExport } from '@/libraries/tableur'
import type { Telephone } from '@/libraries/telephone'

export type BeneficiaireExportRow = {
  readonly nom: Nom
  readonly prenom: Prenom
  readonly email: Email | null
  readonly creation: Date
  readonly accompagnementsCount: number
  readonly notes: Notes | null
  readonly telephone: Telephone | null
  readonly anneeNaissance: AnneeNaissance | null
  readonly trancheAge: TrancheAge
  readonly genre: Genre
  readonly statutSocial: StatutSocial
  readonly communeResidence: CommuneResidence | null
}

type ExportBeneficiairesFilters = {
  readonly recherche?: string
}

export type ConstruireLeClasseurDesBeneficiaires = (input: {
  beneficiaires: readonly BeneficiaireExportRow[]
  filters: ExportBeneficiairesFilters
  matchesCount: number
  auteur: AuteurDExport
  worksheetGenerationDate?: Date
}) => Workbook

/**
 * Cas d'usage complet : récupère les bénéficiaires du médiateur correspondant
 * aux filtres et produit le classeur d'export.
 */
export type ExporterBeneficiaires = (input: {
  mediateurId: MediateurId
  filters: ExportBeneficiairesFilters
  auteur: AuteurDExport
}) => Promise<Workbook>

export type ListerLesBeneficiairesAExporter = (input: {
  mediateurId: MediateurId
  search?: Search
  pageSize: PageSize
}) => Promise<{
  items: readonly BeneficiaireExportRow[]
  totalItems: number
}>
