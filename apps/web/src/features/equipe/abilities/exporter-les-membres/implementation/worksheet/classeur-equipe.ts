import { telephoneDisplayString } from '@app/web/libraries/telephone'
import {
  addExportMetadata,
  type WorksheetUser,
} from '@app/web/libs/worksheet/addExportMetadata'
import { addTitleRow } from '@app/web/libs/worksheet/addTitleRow'
import { autosizeColumns } from '@app/web/libs/worksheet/autosizeColumns'
import { setWorkbookMetadata } from '@app/web/libs/worksheet/setWorkbookMetadata'
import Excel from 'exceljs'
import type { CriteresEquipe } from '../../../../domain'
import type { MembreExporte } from '../../domain'

const libellesDeStatut = new Map<string, string>([
  ['actifs', 'Actifs'],
  ['inactifs', 'Inactifs'],
  ['invitations', 'Invitations'],
  ['archives', 'Archives'],
])

const libellesDeRole = new Map<string, string>([
  ['conseiller-numerique', 'Conseiller numérique'],
  ['mediateur-numerique', 'Médiateur numérique'],
])

const filtresAppliques = ({ statuts, role }: CriteresEquipe): string =>
  [
    ...statuts.map((statut) => libellesDeStatut.get(statut) ?? statut),
    ...(role === null ? [] : [libellesDeRole.get(role) ?? role]),
  ].join(', ') || '-'

const date = (valeur: Date | null): string =>
  valeur === null ? '-' : valeur.toLocaleDateString('fr-FR')

const enTetes = [
  'Prénom',
  'Nom',
  'Rôle',
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

const ligneDuTableau = (membre: MembreExporte) => [
  membre.prenom || '-',
  membre.nom || '-',
  membre.role,
  membre.contrat?.type || '-',
  date(membre.contrat?.debut ?? null),
  date(membre.contrat?.fin ?? null),
  membre.email || '-',
  membre.telephone ? telephoneDisplayString(membre.telephone) : '-',
  membre.structureEmployeuse?.nom || '-',
  membre.structureEmployeuse?.adresse || '-',
  membre.structureEmployeuse?.commune || '-',
  membre.structureEmployeuse?.codePostal || '-',
  membre.structureEmployeuse?.codeInsee || '-',
  membre.statut,
]

export const classeurEquipe = ({
  membres,
  criteres,
  auteur,
  genereLe = new Date(),
}: {
  membres: readonly MembreExporte[]
  criteres: CriteresEquipe
  auteur: WorksheetUser
  genereLe?: Date
}) => {
  const classeur = new Excel.Workbook()
  setWorkbookMetadata(classeur)

  const feuille = classeur.addWorksheet('Équipe')

  addExportMetadata(feuille)({
    user: auteur,
    date: genereLe,
    total: membres.length,
  })

  addTitleRow(feuille)('Filtres')
  feuille.addRows([
    ['Recherche', criteres.recherche ?? '-'],
    ['Filtres', filtresAppliques(criteres)],
    [],
  ])

  addTitleRow(feuille)('Liste des membres')

  const separateur = feuille.addRow([''])

  feuille.addTable({
    name: 'Membres',
    ref: `A${separateur.number + 1}`,
    headerRow: true,
    totalsRow: false,
    columns: enTetes.map((name) => ({ name, filterButton: true })),
    rows: membres.map(ligneDuTableau),
  })

  feuille.eachRow((row) => {
    row.alignment = { wrapText: true, vertical: 'top' }
  })

  autosizeColumns(feuille)

  return classeur
}
