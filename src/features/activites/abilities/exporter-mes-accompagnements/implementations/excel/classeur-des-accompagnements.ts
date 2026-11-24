import Excel from 'exceljs'
import {
  type AuteurDExport,
  addExportMetadata,
} from '@/libraries/tableur/addExportMetadata'
import { addFilters } from '@/libraries/tableur/addFilters'
import { addTitleRow } from '@/libraries/tableur/addTitleRow'
import { autosizeColumns } from '@/libraries/tableur/autosizeColumns'
import { setWorkbookMetadata } from '@/libraries/tableur/setWorkbookMetadata'

type Cellule = string | number | boolean | Date

export type LibelleDeFiltre = { readonly type: string; readonly label: string }

const COLONNE_DE_LA_DATE = 1

const filtresDisponibles = [
  { label: 'Période', type: 'periode' },
  { label: 'Source', type: 'source' },
  { label: 'Lieux d’accompagnement', type: 'lieux' },
  { label: 'Communes', type: 'communes' },
  { label: 'Départements', type: 'departements' },
  { label: 'Type d’accompagnement', type: 'types' },
  { label: 'Rôle', type: 'conseiller_numerique' },
  {
    label: 'Thématiques non administratives',
    type: 'thematiqueNonAdministratives',
  },
  { label: 'Thématiques administratives', type: 'thematiqueAdministratives' },
  { label: 'Tags', type: 'tags' },
  { label: 'Bénéficiaires', type: 'beneficiaires', masqueSiVide: true },
  { label: 'Médiateurs', type: 'mediateurs', masqueSiVide: true },
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
