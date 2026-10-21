import type { LigneUtilisateur } from '@app/web/features/utilisateurs/domain'
import type { LibelleDeFiltre } from '@app/web/features/utilisateurs/ui'
import {
  addExportMetadata,
  type WorksheetUser,
} from '@app/web/libs/worksheet/addExportMetadata'
import { addFilters } from '@app/web/libs/worksheet/addFilters'
import { addTitleRow } from '@app/web/libs/worksheet/addTitleRow'
import { autosizeColumns } from '@app/web/libs/worksheet/autosizeColumns'
import { setWorkbookMetadata } from '@app/web/libs/worksheet/setWorkbookMetadata'
import Excel from 'exceljs'
import { colonnesDeLExport } from './colonnes-de-l-export'

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
}: {
  readonly utilisateurs: readonly LigneUtilisateur[]
  readonly auteur: WorksheetUser
  readonly filtres: readonly LibelleDeFiltre[]
  readonly genereLe: Date
}): Excel.Workbook => {
  const classeur = new Excel.Workbook()
  setWorkbookMetadata(classeur)

  const feuille = classeur.addWorksheet('Utilisateurs')

  addExportMetadata(feuille)({
    user: auteur,
    date: genereLe,
    total: utilisateurs.length,
  })
  addTitleRow(feuille)('Filtres')
  addFilters(
    feuille,
    filtresDisponibles,
  )(filtres.map(({ type, cle, valeur }) => ({ type, key: cle, label: valeur })))

  const separateur = feuille.addRow([''])

  feuille.addTable({
    name: 'Utilisateurs',
    ref: `A${separateur.number + 1}`,
    headerRow: true,
    totalsRow: false,
    columns: colonnesDeLExport.map(({ entete }) => ({
      name: entete,
      filterButton: true,
    })),
    rows: utilisateurs.map((utilisateur) =>
      colonnesDeLExport.map(({ valeur }) => valeur(utilisateur)),
    ),
  })

  feuille.eachRow((rangee) => {
    rangee.alignment = { wrapText: true, vertical: 'top' }
  })

  autosizeColumns(feuille)

  return classeur
}
