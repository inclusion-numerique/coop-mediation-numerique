import Excel from 'exceljs'
import type { LigneUtilisateur } from '@/features/utilisateurs/domain'
import {
  type AuteurDExport,
  addExportMetadata,
} from '@/libraries/tableur/addExportMetadata'
import { addFilters } from '@/libraries/tableur/addFilters'
import { addTitleRow } from '@/libraries/tableur/addTitleRow'
import { autosizeColumns } from '@/libraries/tableur/autosizeColumns'
import { setWorkbookMetadata } from '@/libraries/tableur/setWorkbookMetadata'

type Colonne = {
  readonly entete: string
  readonly valeur: (ligne: LigneUtilisateur) => string | number | null
}

const filtresDisponibles = [
  { label: 'Rôles', type: 'roles' },
  { label: 'Dispositif', type: 'conseiller_numerique' },
  { label: 'Statut', type: 'statut' },
  { label: 'Employeuses', type: 'employeuses' },
  { label: 'Lieux', type: 'lieux' },
  { label: 'Communes', type: 'communes' },
  { label: 'Départements', type: 'departements' },
]

export const classeurDesUtilisateurs = ({
  utilisateurs,
  auteur,
  filtres,
  genereLe,
  colonnes,
}: {
  readonly utilisateurs: readonly LigneUtilisateur[]
  readonly auteur: AuteurDExport
  readonly filtres: readonly {
    readonly type: string
    readonly valeur: string
  }[]
  readonly genereLe: Date
  readonly colonnes: readonly Colonne[]
}): Excel.Workbook => {
  const classeur = new Excel.Workbook()
  setWorkbookMetadata(classeur)

  const feuille = classeur.addWorksheet('Utilisateurs')

  addExportMetadata(feuille)({
    auteur: auteur,
    date: genereLe,
    total: utilisateurs.length,
  })
  addTitleRow(feuille)('Filtres')
  addFilters(
    feuille,
    filtresDisponibles,
  )(filtres.map(({ type, valeur }) => ({ type, label: valeur })))

  const separateur = feuille.addRow([''])

  feuille.addTable({
    name: 'Utilisateurs',
    ref: `A${separateur.number + 1}`,
    headerRow: true,
    totalsRow: false,
    columns: colonnes.map(({ entete }) => ({
      name: entete,
      filterButton: true,
    })),
    rows: utilisateurs.map((utilisateur) =>
      colonnes.map(({ valeur }) => valeur(utilisateur)),
    ),
  })

  feuille.eachRow((rangee) => {
    rangee.alignment = { wrapText: true, vertical: 'top' }
  })

  autosizeColumns(feuille)

  return classeur
}
