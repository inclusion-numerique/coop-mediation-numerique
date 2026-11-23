import { PageSize, Search } from '@arckit/resultset'
import type { BeneficiaireListItem } from '@/features/beneficiaire/abilities/lister-beneficiaires/domain/lister-beneficiaires'
import { listerBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/implementations/prisma/lister-beneficiaires.query'
import type {
  BeneficiaireExportRow,
  ExporterBeneficiaires,
} from '../domain/exporter-beneficiaires'
import { buildBeneficiairesWorksheet } from './excel/classeur-des-beneficiaires'

// L'export liste tous les bénéficiaires correspondants (pas de pagination).
const EXPORT_PAGE_SIZE = PageSize(10_000)

const toExportRow = (item: BeneficiaireListItem): BeneficiaireExportRow => ({
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

export const exporterBeneficiaires: ExporterBeneficiaires = async ({
  mediateurId,
  filters,
  auteur,
}) => {
  const { items, totalItems } = await listerBeneficiaires({
    mediateurId,
    search: filters.recherche ? Search(filters.recherche) : undefined,
    pageSize: EXPORT_PAGE_SIZE,
  })

  return buildBeneficiairesWorksheet({
    beneficiaires: items.map(toExportRow),
    filters,
    matchesCount: totalItems,
    auteur,
  })
}
