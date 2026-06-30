import type { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
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
import type { WorksheetUser } from '@app/web/libs/worksheet/addExportMetadata'
import type { Workbook } from 'exceljs'

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

export type ExportBeneficiairesFilters = {
  readonly recherche?: string
}

export type BuildBeneficiairesWorksheet = (input: {
  beneficiaires: readonly BeneficiaireExportRow[]
  filters: ExportBeneficiairesFilters
  matchesCount: number
  user: WorksheetUser
  worksheetGenerationDate?: Date
}) => Workbook

/**
 * Cas d'usage complet : récupère les bénéficiaires du médiateur correspondant
 * aux filtres et produit le classeur d'export.
 */
export type ExporterBeneficiaires = (input: {
  mediateurId: MediateurId
  filters: ExportBeneficiairesFilters
  user: WorksheetUser
}) => Promise<Workbook>
