import type { PageSize, Search } from '@arckit/resultset'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type {
  BeneficiaireExportRow,
  FiltresDeLExport,
} from './beneficiaire-a-exporter'

export type ListerLesBeneficiairesAExporter = (input: {
  mediateurId: MediateurId
  search?: Search
  pageSize: PageSize
  maintenant: Date
}) => Promise<{
  items: readonly BeneficiaireExportRow[]
  totalItems: number
}>

export type ConstruireLeClasseurDesBeneficiaires<Auteur, Classeur> = (input: {
  beneficiaires: readonly BeneficiaireExportRow[]
  filters: FiltresDeLExport
  matchesCount: number
  auteur: Auteur
  worksheetGenerationDate: Date
}) => Classeur

export type ExporterBeneficiairesPorts<Auteur, Classeur> = {
  readonly listerBeneficiaires: ListerLesBeneficiairesAExporter
  readonly construireLeClasseur: ConstruireLeClasseurDesBeneficiaires<
    Auteur,
    Classeur
  >
}
