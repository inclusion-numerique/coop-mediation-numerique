import Excel from 'exceljs'
import {
  type AuteurDExport,
  addExportMetadata,
} from '@/libraries/tableur/add-export-metadata'
import { addFilters } from '@/libraries/tableur/add-filters'
import { addTitleRow } from '@/libraries/tableur/add-title-row'
import { autosizeColumns } from '@/libraries/tableur/autosize-columns'
import { setWorkbookMetadata } from '@/libraries/tableur/set-workbook-metadata'

type Cellule = string | number | boolean | Date

export type LibelleDeFiltre = { readonly type: string; readonly label: string }

const COLONNE_DE_LA_DATE = 1

const filtresDisponibles = [
  { label: 'Période', type: 'Période' },
  { label: 'Source', type: 'Source' },
  { label: 'Lieux d’accompagnement', type: 'Lieux d’accompagnement' },
  { label: 'Communes', type: 'Communes' },
  { label: 'Départements', type: 'Départements' },
  { label: 'Type d’accompagnement', type: 'Type d’accompagnement' },
  { label: 'Rôle', type: 'Rôle' },
  {
    label: 'Thématiques non administratives',
    type: 'Thématiques non administratives',
  },
  { label: 'Thématiques administratives', type: 'Thématiques administratives' },
  { label: 'Tags', type: 'Tags' },
  { label: 'Bénéficiaires', type: 'Bénéficiaires', masqueSiVide: true },
  { label: 'Médiateurs', type: 'Médiateurs', masqueSiVide: true },
]

export const classeurDesAccompagnements = ({
  demandeur,
  filtres,
  entetes,
  lignes,
  total,
  fuseau,
  date = new Date(),
}: {
  readonly demandeur: AuteurDExport
  readonly filtres: readonly LibelleDeFiltre[]
  readonly entetes: readonly string[]
  readonly lignes: readonly (readonly Cellule[])[]
  readonly total: number
  readonly fuseau: string
  readonly date?: Date
}): Excel.Workbook => {
  const classeur = new Excel.Workbook()
  setWorkbookMetadata(classeur)({ worksheetGenerationDate: date })
  const feuille = classeur.addWorksheet('Activités')

  addExportMetadata(feuille)({
    auteur: demandeur,
    date,
    fuseau,
    total,
  })
  addTitleRow(feuille)('Filtres')
  addFilters(feuille, filtresDisponibles)(filtres)
  feuille.addRow([])

  const premiereLigneDuTableau = feuille.addRow(['']).number + 1

  feuille.addTable({
    name: 'Activités',
    ref: `A${premiereLigneDuTableau}`,
    headerRow: true,
    totalsRow: false,
    columns: entetes.map((name) => ({
      name,
      filterButton: true,
    })),
    rows: lignes.map((ligne) => [...ligne]),
  })

  feuille
    .getColumn(COLONNE_DE_LA_DATE)
    .eachCell({ includeEmpty: true }, (cellule, numero) => {
      if (numero >= premiereLigneDuTableau && cellule.value) {
        cellule.numFmt = 'dd/mm/yyyy'
      }
    })
  feuille.eachRow((ligne) => {
    ligne.alignment = { wrapText: true, vertical: 'top' }
  })
  autosizeColumns(feuille)

  return classeur
}
