import type {
  EquipeSearchParams,
  FilterParam,
  RoleFiltre,
} from '@app/web/equipe/EquipeListePage/searchMediateursCoordonneBy'
import {
  addExportMetadata,
  WorksheetUser,
} from '@app/web/libs/worksheet/addExportMetadata'
import { addTitleRow } from '@app/web/libs/worksheet/addTitleRow'
import { autosizeColumns } from '@app/web/libs/worksheet/autosizeColumns'
import { setWorkbookMetadata } from '@app/web/libs/worksheet/setWorkbookMetadata'
import * as Excel from 'exceljs'
import type { EquipeExportMembre } from './getEquipeExportData'

const formatDate = (date: Date | null): string => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}

const statutFilterLabels: Record<FilterParam, string> = {
  actifs: 'Actifs',
  inactifs: 'Inactifs',
  invitations: 'Invitations',
  archives: 'Archives',
}

const roleFilterLabels: Record<RoleFiltre, string> = {
  'conseiller-numerique': 'Conseiller numérique',
  'mediateur-numerique': 'Médiateur numérique',
}

const toStatutFilterLabel = (statut: FilterParam): string =>
  statutFilterLabels[statut] ?? statut

const formatFilters = ({ statut, role }: EquipeSearchParams): string => {
  const statutLabels = statut
    ? (statut.split(',') as FilterParam[])
        .filter(Boolean)
        .map(toStatutFilterLabel)
    : []

  const roleLabels = role ? [roleFilterLabels[role] ?? role] : []

  return [...statutLabels, ...roleLabels].join(', ') || '-'
}

export const buildEquipeWorksheet = ({
  membres,
  filters,
  user,
  worksheetGenerationDate = new Date(),
}: {
  membres: EquipeExportMembre[]
  filters: EquipeSearchParams
  user: WorksheetUser
  worksheetGenerationDate?: Date
}) => {
  const workbook = new Excel.Workbook()

  setWorkbookMetadata(workbook)

  const worksheet = workbook.addWorksheet('Équipe')

  addExportMetadata(worksheet)({
    user,
    date: worksheetGenerationDate,
    total: membres.length,
  })

  addTitleRow(worksheet)('Filtres')
  worksheet.addRows([
    ['Recherche', filters.recherche ?? '-'],
    ['Filtres', formatFilters(filters)],
    [],
  ])

  addTitleRow(worksheet)('Liste des membres')

  const tableHeaders = [
    'Prénom',
    'Nom',
    'Rôle',
    'ID Conum',
    'Type de contrat',
    'Date de début de contrat',
    'Date de fin de contrat',
    'Adresse email',
    'Numéro de téléphone',
    'Structure employeuse - Nom',
    'Structure employeuse - Adresse',
    'Structure employeuse - Commune',
    'Structure employeuse - Code postal',
    'Structure employeuse - Code Insee',
    'Statut',
  ]

  const separatorRowBeforeTable = worksheet.addRow([''])

  worksheet.addTable({
    name: 'Membres',
    ref: `A${separatorRowBeforeTable.number + 1}`,
    headerRow: true,
    totalsRow: false,
    columns: tableHeaders.map((label) => ({
      name: label,
      filterButton: true,
    })),
    rows: membres.map((membre) => [
      membre.prenom ?? '-',
      membre.nom ?? '-',
      membre.role,
      membre.idConum ?? '-',
      membre.typeContrat ?? '-',
      formatDate(membre.dateDebutContrat),
      formatDate(membre.dateFinContrat),
      membre.email || '-',
      membre.telephone ?? '-',
      membre.structureEmployeuse?.nom ?? '-',
      membre.structureEmployeuse?.adresse ?? '-',
      membre.structureEmployeuse?.commune ?? '-',
      membre.structureEmployeuse?.codePostal ?? '-',
      membre.structureEmployeuse?.codeInsee ?? '-',
      membre.statut,
    ]),
  })

  worksheet.eachRow((row) => {
    row.alignment = { wrapText: true, vertical: 'top' }
  })

  autosizeColumns(worksheet)

  return workbook
}
