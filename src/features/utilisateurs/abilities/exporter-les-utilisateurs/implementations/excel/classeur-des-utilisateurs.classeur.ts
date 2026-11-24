import Excel from 'exceljs'
import type { LigneUtilisateur } from '@/features/utilisateurs/domain'
import {
  type AuteurDExport,
  addExportMetadata,
} from '@/libraries/tableur/add-export-metadata'
import { addFilters } from '@/libraries/tableur/add-filters'
import { addTitleRow } from '@/libraries/tableur/add-title-row'
import { autosizeColumns } from '@/libraries/tableur/autosize-columns'
import { setWorkbookMetadata } from '@/libraries/tableur/set-workbook-metadata'

type Colonne = {
  readonly entete: string
  readonly valeur: (ligne: LigneUtilisateur) => string | number | null
}

const filtresDisponibles = [
  { label: 'Rôles', type: 'Rôles' },
  { label: 'Dispositif', type: 'Dispositif' },
  { label: 'Statut', type: 'Statut' },
  { label: 'Employeuses', type: 'Employeuses' },
  { label: 'Lieux', type: 'Lieux d’activité' },
  { label: 'Communes', type: 'Communes' },
  { label: 'Départements', type: 'Départements' },
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
