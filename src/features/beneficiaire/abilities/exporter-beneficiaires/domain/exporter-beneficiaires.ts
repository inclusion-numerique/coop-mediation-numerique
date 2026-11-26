import { PageSize, Search } from '@arckit/resultset'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { type Result, success } from '@/libraries/result'
import type { FiltresDeLExport } from './beneficiaire-a-exporter'
import type { EchecDExporterBeneficiaires } from './errors'
import type { ExporterBeneficiairesPorts } from './ports'

const TOUS_LES_BENEFICIAIRES = PageSize(10_000)

export const exporterBeneficiaires =
  <Auteur, Classeur>({
    listerBeneficiaires,
    construireLeClasseur,
  }: ExporterBeneficiairesPorts<Auteur, Classeur>) =>
  async ({
    mediateurId,
    filters,
    auteur,
    maintenant,
  }: {
    readonly mediateurId: MediateurId
    readonly filters: FiltresDeLExport
    readonly auteur: Auteur
    readonly maintenant: Date
  }): Promise<Result<Classeur, EchecDExporterBeneficiaires>> => {
    const { items, totalItems } = await listerBeneficiaires({
      mediateurId,
      ...(filters.recherche ? { search: Search(filters.recherche) } : {}),
      pageSize: TOUS_LES_BENEFICIAIRES,
    })

    return success(
      construireLeClasseur({
        beneficiaires: items,
        filters,
        matchesCount: totalItems,
        auteur,
        worksheetGenerationDate: maintenant,
      }),
    )
  }
