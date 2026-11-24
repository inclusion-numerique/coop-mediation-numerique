import Excel from 'exceljs'
import {
  sexLabels,
  statutSocialLabels,
  trancheAgeLabels,
} from '@/features/beneficiaire/domain'
import { addExportMetadata } from '@/libraries/tableur/add-export-metadata'
import { addTitleRow } from '@/libraries/tableur/add-title-row'
import { autosizeColumns } from '@/libraries/tableur/autosize-columns'
import { setWorkbookMetadata } from '@/libraries/tableur/set-workbook-metadata'
import { telephoneDisplayString } from '@/libraries/telephone'
import { htmlToText } from '@/libraries/texte/html-to-text'
import type {
  BeneficiaireExportRow,
  ConstruireLeClasseurDesBeneficiaires,
} from '../../domain/exporter-beneficiaires'

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
  beneficiaire.telephone ? telephoneDisplayString(beneficiaire.telephone) : '-',
  beneficiaire.email ?? '-',
  sexLabels[beneficiaire.genre],
  trancheAgeLabels[beneficiaire.trancheAge],
  statutSocialLabels[beneficiaire.statutSocial],
  beneficiaire.accompagnementsCount,
  beneficiaire.notes ? htmlToText(beneficiaire.notes) : '',
]

export const classeurDesBeneficiaires: ConstruireLeClasseurDesBeneficiaires = ({
  beneficiaires,
  filters,
  auteur,
  worksheetGenerationDate = new Date(),
  matchesCount,
}) => {
  const workbook = new Excel.Workbook()

  setWorkbookMetadata(workbook)

  const worksheet = workbook.addWorksheet('Bénéficiaires')

  addExportMetadata(worksheet)({
    auteur,
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
