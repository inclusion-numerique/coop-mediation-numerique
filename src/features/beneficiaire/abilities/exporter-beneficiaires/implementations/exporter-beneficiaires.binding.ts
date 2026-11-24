import { PageSize, Search } from '@arckit/resultset'
import type {
  BeneficiaireExportRow,
  ExporterBeneficiaires,
  ListerLesBeneficiairesAExporter,
} from '../domain/exporter-beneficiaires'
import { classeurDesBeneficiaires } from './excel/classeur-des-beneficiaires'

// L'export liste tous les bénéficiaires correspondants (pas de pagination).
const EXPORT_PAGE_SIZE = PageSize(10_000)

const toExportRow = (item: BeneficiaireExportRow): BeneficiaireExportRow => ({
  nom: item.nom,
  prenom: item.prenom,
  email: item.email,
  creation: item.creation,
  accompagnementsCount: item.accompagnementsCount,
  notes: item.notes,
  telephone: item.telephone,
  anneeNaissance: item.anneeNaissance,
  trancheAge: item.trancheAge,
  genre: item.genre,
  statutSocial: item.statutSocial,
  communeResidence: item.communeResidence,
})

export const exporterBeneficiairesAvec =
  (
    listerBeneficiaires: ListerLesBeneficiairesAExporter,
  ): ExporterBeneficiaires =>
  async ({ mediateurId, filters, auteur }) => {
    const { items, totalItems } = await listerBeneficiaires({
      mediateurId,
      search: filters.recherche ? Search(filters.recherche) : undefined,
      pageSize: EXPORT_PAGE_SIZE,
    })

    return classeurDesBeneficiaires({
      beneficiaires: items.map(toExportRow),
      filters,
      matchesCount: totalItems,
      auteur,
    })
  }
