import Excel from 'exceljs'
import type { LigneUtilisateur } from '@/features/utilisateurs/domain'
import { type LibelleDeFiltre } from '@/features/utilisateurs/ui/libelles-des-filtres.presenter'
import {
  type AuteurDExport,
  addExportMetadata,
} from '@/libraries/tableur/addExportMetadata'
import { addFilters } from '@/libraries/tableur/addFilters'
import { addTitleRow } from '@/libraries/tableur/addTitleRow'
import { autosizeColumns } from '@/libraries/tableur/autosizeColumns'
import { setWorkbookMetadata } from '@/libraries/tableur/setWorkbookMetadata'
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
  readonly auteur: AuteurDExport
  readonly filtres: readonly LibelleDeFiltre[]
  readonly genereLe: Date
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
