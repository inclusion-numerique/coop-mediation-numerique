import {
  sexLabels,
  statutSocialLabels,
  trancheAgeLabels,
} from '@app/web/features/beneficiaire/domain'
import { addExportMetadata } from '@app/web/libs/worksheet/addExportMetadata'
import { addTitleRow } from '@app/web/libs/worksheet/addTitleRow'
import { autosizeColumns } from '@app/web/libs/worksheet/autosizeColumns'
import { setWorkbookMetadata } from '@app/web/libs/worksheet/setWorkbookMetadata'
import { htmlToText } from '@app/web/utils/htmlToText'
import * as Excel from 'exceljs'
import type {
  BeneficiaireExportRow,
  BuildBeneficiairesWorksheet,
} from '../domain/exporter-beneficiaires'

const beneficiairesTableHeaders = [
  'Nom',
  'Prénom',
  'Année de naissance',
  'Nom de la commune',
  'Code INSEE',
  'Code postal',
  'N° de téléphone',
  'E-mail',
  'Genre',
  'Tranche d\u2019âge',
  'Statut',
  'Nombre d\u2019accompagnements',
  'Notes supplémentaires',
]

const toRow = (beneficiaire: BeneficiaireExportRow) => [
  beneficiaire.nom,
  beneficiaire.prenom,
  beneficiaire.anneeNaissance ?? '-',
  beneficiaire.communeResidence?.commune ?? '-',
  beneficiaire.communeResidence?.codeInsee ?? '-',
  beneficiaire.communeResidence?.codePostal ?? '-',
  beneficiaire.telephone ?? '-',
  beneficiaire.email ?? '-',
  sexLabels[beneficiaire.genre],
  trancheAgeLabels[beneficiaire.trancheAge],
  statutSocialLabels[beneficiaire.statutSocial],
  beneficiaire.accompagnementsCount,
  beneficiaire.notes ? htmlToText(beneficiaire.notes) : '',
]

export const buildBeneficiairesWorksheet: BuildBeneficiairesWorksheet = ({
  beneficiaires,
  filters,
  user,
  worksheetGenerationDate = new Date(),
  matchesCount,
}) => {
  const workbook = new Excel.Workbook()

  setWorkbookMetadata(workbook)

  const worksheet = workbook.addWorksheet('Bénéficiaires')

  addExportMetadata(worksheet)({
    user,
    date: worksheetGenerationDate,
    total: matchesCount,
  })

  addTitleRow(worksheet)('Filtres')
  worksheet.addRows([['Recherche', filters.recherche ?? '-'], []])

  const separatorRowBeforeTable = worksheet.addRow([''])

  worksheet.addTable({
    name: 'Activités',
    ref: `A${separatorRowBeforeTable.number + 1}`,
    headerRow: true,
    totalsRow: false,
    columns: beneficiairesTableHeaders.map((label) => ({
      name: label,
      filterButton: true,
    })),
    rows: beneficiaires.map(toRow),
  })

  worksheet.eachRow((row) => {
    row.alignment = { wrapText: true, vertical: 'top' }
  })

  autosizeColumns(worksheet)

  return workbook
}
