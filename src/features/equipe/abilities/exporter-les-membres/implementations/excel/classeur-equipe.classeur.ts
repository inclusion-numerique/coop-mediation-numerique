import Excel from 'exceljs'
import {
  type AuteurDExport,
  addExportMetadata,
} from '@/libraries/tableur/add-export-metadata'
import { addTitleRow } from '@/libraries/tableur/add-title-row'
import { autosizeColumns } from '@/libraries/tableur/autosize-columns'
import { setWorkbookMetadata } from '@/libraries/tableur/set-workbook-metadata'
import { telephoneDisplayString } from '@/libraries/telephone'
import type { CriteresEquipe, LigneEquipe } from '../../../../domain'
import type { ContratMembre, MembreAExporter } from '../../domain'

export type MembreExporte = {
  readonly prenom: string | null
  readonly nom: string | null
  readonly role: string
  readonly contrat: ContratMembre | null
  readonly email: string
  readonly telephone: string | null
  readonly structureEmployeuse: {
    readonly nom: string | null
    readonly adresse: string | null
    readonly commune: string | null
    readonly codePostal: string | null
    readonly codeInsee: string | null
  } | null
  readonly statut: string
}

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

const libellesDeContrat: ReadonlyMap<string, string> = new Map([
  ['CDP', 'Contrat de projet'],
  ['NonCommunique', '-'],
])

const libelleDuContrat = (contrat: ContratMembre | null): string =>
  contrat === null ? '-' : (libellesDeContrat.get(contrat.type) ?? contrat.type)

const ligneDuTableau = (membre: MembreExporte) => [
  membre.prenom || '-',
  membre.nom || '-',
  membre.role,
  libelleDuContrat(membre.contrat),
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
  auteur: AuteurDExport
  genereLe?: Date
}) => {
  const classeur = new Excel.Workbook()
  setWorkbookMetadata(classeur)

  const feuille = classeur.addWorksheet('Équipe')

  addExportMetadata(feuille)({
    auteur: auteur,
    date: genereLe,
    total: membres.length,
  })

  addTitleRow(feuille)('Filtres')
  feuille.addRows([
    ['Recherche', criteres.recherche === '' ? '-' : criteres.recherche],
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

export const classeurDesMembresAvec =
  (
    presenter: (
      ligne: LigneEquipe,
      contrat: ContratMembre | null,
    ) => MembreExporte,
  ) =>
  ({
    membres,
    ...reste
  }: Omit<Parameters<typeof classeurEquipe>[0], 'membres'> & {
    membres: readonly MembreAExporter<LigneEquipe>[]
  }) =>
    classeurEquipe({
      ...reste,
      membres: membres.map(({ ligne, contrat }) => presenter(ligne, contrat)),
    })
