import { MediateurUser } from '@app/web/auth/userTypeGuards'
import {
  sexLabels,
  statutSocialLabels,
  trancheAgeLabels,
} from '@app/web/beneficiaire/beneficiaire'
import { addExportMetadata } from '@app/web/libs/worksheet/addExportMetadata'
import { addTitleRow } from '@app/web/libs/worksheet/addTitleRow'
import { autosizeColumns } from '@app/web/libs/worksheet/autosizeColumns'
import { setWorkbookMetadata } from '@app/web/libs/worksheet/setWorkbookMetadata'
import { htmlToText } from '@app/web/utils/htmlToText'
import type { Genre, StatutSocial, TrancheAge } from '@prisma/client'
import * as Excel from 'exceljs'
import { ExportBeneficiairesFilterData } from './exportBeneficiairesFilter'

export const buildBeneficiairesWorksheet = ({
  beneficiaires,
  filters,
  user,
  worksheetGenerationDate = new Date(),
  matchesCount,
}: {
  beneficiaires: {
    nom: string
    prenom: string
    email: string | null
    creation: Date
    accompagnementsCount: number
    notes: string | null
    mediateurId: string
    telephone: string | null
    anneeNaissance: number | null
    trancheAge: TrancheAge | null
    genre: Genre | null
    statutSocial: StatutSocial | null
    communeResidence: {
      codePostal: string
      codeInsee: string
      commune: string
    } | null
  }[]
  filters: ExportBeneficiairesFilterData
  matchesCount: number
  user: MediateurUser
  worksheetGenerationDate?: Date
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
    'Tranche d’âge',
    'Statut',
    'Nombre d’accompagnements',
    'Notes supplémentaires',
  ]

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
    rows: beneficiaires.map((beneficiaire) => [
      beneficiaire.nom,
      beneficiaire.prenom,
      beneficiaire.anneeNaissance ?? '-',
      beneficiaire.communeResidence?.commune ?? '-',
      beneficiaire.communeResidence?.codeInsee ?? '-',
      beneficiaire.communeResidence?.codePostal ?? '-',
      beneficiaire.telephone ?? '-',
      beneficiaire.email ?? '-',
      beneficiaire.genre ? sexLabels[beneficiaire.genre] : 'Non communiqué',
      beneficiaire.trancheAge
        ? trancheAgeLabels[beneficiaire.trancheAge]
        : 'Non communiqué',
      beneficiaire.statutSocial
        ? statutSocialLabels[beneficiaire.statutSocial]
        : 'Non communiqué',
      beneficiaire.accompagnementsCount,
      beneficiaire.notes ? htmlToText(beneficiaire.notes) : '',
    ]),
  })

  worksheet.eachRow((row) => {
    row.alignment = { wrapText: true, vertical: 'top' }
  })

  autosizeColumns(worksheet)

  return workbook
}
