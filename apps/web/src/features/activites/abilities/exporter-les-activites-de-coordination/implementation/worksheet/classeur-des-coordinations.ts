import {
  addExportMetadata,
  type WorksheetUser,
} from '@app/web/libs/worksheet/addExportMetadata'
import { addTitleRow } from '@app/web/libs/worksheet/addTitleRow'
import { autosizeColumns } from '@app/web/libs/worksheet/autosizeColumns'
import { setWorkbookMetadata } from '@app/web/libs/worksheet/setWorkbookMetadata'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { htmlToText } from '@app/web/utils/htmlToText'
import { format, isEqual } from 'date-fns'
import { fr } from 'date-fns/locale'
import * as Excel from 'exceljs'
import type {
  ActiviteDeCoordination,
  CriteresDesCoordinations,
  TagDeLActivite,
} from '../../../../domain'
import {
  autreAvecPrecision,
  libelleDeLEchelon,
  libelleDeLInitiative,
  libelleDuType,
  libelleDuTypeDeStructure,
  objetsDe,
  organisateursDe,
  thematiquesDe,
} from '../../../../ui/libelles-de-coordination'

type Type = ActiviteDeCoordination['_tag']

const SAUT_DE_LIGNE = '\n'
const SANS_OBJET = '/'

const ENTETES = [
  'Date de l’activité',
  'Type',
  'Durée (min.)',
  'Participants',
  'Médiateur·ice·s numérique·s',
  'Structure·s',
  'Autres acteur.trice.s',
  'Nom de l’évènement',
  'Type d’animation, type d’évènement, nature du partenariat',
  'Organisé par',
  'Structure·s partenaire·s (Nom)',
  'Structure·s partenaire·s (type)',
  'Échelon territorial de l’évènement ou du partenariat',
  'Qui est à l’initiative de cette intervention ?',
  'Thématique(s) d’animation',
  'Tags',
  'Notes',
  'Enregistrée le',
  'Dernière modification le',
  'ID CRA',
]

const pour =
  (activite: ActiviteDeCoordination) =>
  (types: readonly Type[], valeur: () => string | number | null) =>
    types.includes(activite._tag) ? (valeur() ?? '') : SANS_OBJET

const lignes = (valeurs: readonly (string | null)[]): string =>
  valeurs.filter((valeur) => valeur !== null).join(SAUT_DE_LIGNE)

const horodatage = (date: Date): string =>
  format(date, "dd/MM/yyyy 'à' HH:mm", { locale: fr })

const ligneDe = (activite: ActiviteDeCoordination) => {
  const seulementPour = pour(activite)
  const animation = activite._tag === 'Animation' ? activite : null
  const evenement = activite._tag === 'Evenement' ? activite : null
  const partenariat = activite._tag === 'Partenariat' ? activite : null
  const echelon = activite._tag === 'Animation' ? null : activite.echelon
  const nom = activite._tag === 'Animation' ? null : activite.nom

  return [
    activite.date,
    libelleDuType(activite._tag),
    seulementPour(['Animation'], () => activite.duree),
    seulementPour(['Evenement'], () => evenement?.participants ?? null),
    seulementPour(
      ['Animation'],
      () => animation?.intervenants.mediateurs ?? null,
    ),
    seulementPour(
      ['Animation'],
      () => animation?.intervenants.structures ?? null,
    ),
    seulementPour(
      ['Animation'],
      () => animation?.intervenants.autresActeurs ?? null,
    ),
    seulementPour(['Evenement', 'Partenariat'], () => nom),
    lignes(objetsDe(autreAvecPrecision)(activite)),
    seulementPour(['Evenement'], () =>
      lignes(organisateursDe(autreAvecPrecision)(activite)),
    ),
    seulementPour(['Partenariat'], () =>
      lignes(partenariat?.structuresPartenaires.map(({ nom }) => nom) ?? []),
    ),
    seulementPour(['Partenariat'], () =>
      lignes(
        partenariat?.structuresPartenaires.map(({ type }) =>
          libelleDuTypeDeStructure(type),
        ) ?? [],
      ),
    ),
    seulementPour(['Evenement', 'Partenariat'], () =>
      echelon === null ? null : libelleDeLEchelon(echelon),
    ),
    seulementPour(['Animation'], () =>
      animation?.initiative == null
        ? null
        : libelleDeLInitiative(animation.initiative),
    ),
    seulementPour(['Animation'], () =>
      lignes(thematiquesDe(autreAvecPrecision)(activite)),
    ),
    lignes(activite.tags.map(({ nom }) => nom)),
    activite.notes === null ? '' : htmlToText(activite.notes),
    horodatage(activite.creation),
    isEqual(activite.creation, activite.modification)
      ? ''
      : horodatage(activite.modification),
    activite.id,
  ]
}

const filtresDe = (
  { periode, types }: CriteresDesCoordinations,
  tags: readonly TagDeLActivite[],
): readonly (readonly string[])[] => [
  [
    'Période',
    periode === null
      ? '-'
      : `${dateAsIsoDay(periode.du)} - ${dateAsIsoDay(periode.au)}`,
  ],
  ['Type d’activité', types.map(libelleDuType).join(', ') || '-'],
  ['Tags', tags.map(({ nom }) => nom).join(', ') || '-'],
]

export const classeurDesCoordinations = ({
  activites,
  criteres,
  tags,
  auteur,
  genereLe = new Date(),
}: {
  activites: readonly ActiviteDeCoordination[]
  criteres: CriteresDesCoordinations
  tags: readonly TagDeLActivite[]
  auteur: WorksheetUser
  genereLe?: Date
}): Excel.Workbook => {
  const classeur = new Excel.Workbook()
  setWorkbookMetadata(classeur)

  const feuille = classeur.addWorksheet('Activités de coordination')
  addExportMetadata(feuille)({
    user: auteur,
    date: genereLe,
    total: activites.length,
  })

  addTitleRow(feuille)('Filtres')
  feuille.addRows([...filtresDe(criteres, tags).map((ligne) => [...ligne]), []])

  const debutDuTableau = feuille.addRow(['']).number + 1

  feuille.addTable({
    name: 'Activites_de_coordination',
    ref: `A${debutDuTableau}`,
    headerRow: true,
    totalsRow: false,
    columns: ENTETES.map((name) => ({ name, filterButton: true })),
    rows: activites.map(ligneDe),
  })

  feuille.getColumn(1).eachCell({ includeEmpty: true }, (cellule, rang) => {
    if (rang >= debutDuTableau && cellule.value) cellule.numFmt = 'dd/mm/yyyy'
  })

  feuille.eachRow((ligne) => {
    ligne.alignment = { wrapText: true, vertical: 'top' }
  })

  autosizeColumns(feuille)

  return classeur
}
