import {
  addExportMetadata,
  WorksheetUser,
} from '@app/web/libs/worksheet/addExportMetadata'
import { addTitleRow } from '@app/web/libs/worksheet/addTitleRow'
import { autosizeColumns } from '@app/web/libs/worksheet/autosizeColumns'
import { setWorkbookMetadata } from '@app/web/libs/worksheet/setWorkbookMetadata'
import { htmlToText } from '@app/web/utils/htmlToText'
import { format, isEqual } from 'date-fns'
import { fr } from 'date-fns/locale'
import * as Excel from 'exceljs'
import {
  INITIATIVE_OPTIONS,
  THEMATIQUE_ANIMATION_OPTIONS,
  TYPE_ANIMATION_OPTIONS,
} from '../../cra/animation/labels'
import { TYPE_ACTIVITE_OPTIONS } from '../../cra/coordination/labels'
import {
  ECHELON_TERRITORIAL_OPTIONS,
  ORGANISATEURS_OPTIONS,
  TYPE_EVENEMENT_OPTIONS,
} from '../../cra/evenement/labels'
import {
  NATURE_OPTIONS,
  TYPE_DE_STRUCTURE_PARTENAIRE_OPTIONS,
} from '../../cra/partenariat/labels'
import { ActiviteCoordinationListItem } from './getActivitesCoordinationWorksheetInput'

type TypeActiviteCoordination = 'Animation' | 'Evenement' | 'Partenariat'

export type BuildActivitesWorksheetInput = {
  user: WorksheetUser
  activites: ActiviteCoordinationListItem[]
  worksheetGenerationDate?: Date
}

const intraCellLineBreak = '\n'

const valueMatch =
  (check: string | null) =>
  ({ value }: { value: string }) =>
    value === check

const emptyFor =
  (...types: TypeActiviteCoordination[]) =>
  (activite: { type: TypeActiviteCoordination }) =>
    types.includes(activite.type) ? '' : '/'

const toAutre = (autre: string | null) => (label?: string) =>
  label === 'Autre' ? `Autre : ${autre}` : label

export const buildActivitesCoordinationWorksheet = (
  {
    activites,
    user,
    worksheetGenerationDate = new Date(),
  }: BuildActivitesWorksheetInput,
  filters: { label: string; value: string | undefined }[],
): Excel.Workbook => {
  const workbook = new Excel.Workbook()

  setWorkbookMetadata(workbook)

  const worksheet = workbook.addWorksheet('Activités de coordination')

  addExportMetadata(worksheet)({
    user,
    date: worksheetGenerationDate,
    total: activites.length,
  })

  addTitleRow(worksheet)('Filtres')
  worksheet.addRows([
    ...filters.map(({ label, value }) => [label, value || '-']),
    [],
  ])

  const activitesTableHeaders = [
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

  const separatorRowBeforeTable = worksheet.addRow([''])

  const tableStartRowNumber = separatorRowBeforeTable.number + 1

  worksheet.addTable({
    name: 'Activités de coordination',
    ref: `A${tableStartRowNumber}`,
    headerRow: true,
    totalsRow: false,
    columns: activitesTableHeaders.map((label) => ({
      name: label,
      filterButton: true,
    })),
    rows: activites.map((activite) => [
      activite.date,
      TYPE_ACTIVITE_OPTIONS.find(valueMatch(activite.type))?.label ?? '',
      activite.duree ?? emptyFor('Animation')(activite),
      activite.participants ?? emptyFor('Evenement')(activite),
      activite.mediateurs ?? emptyFor('Animation')(activite),
      activite.structures ?? emptyFor('Animation')(activite),
      activite.autresActeurs ?? emptyFor('Animation')(activite),
      activite.nomEvenement ?? emptyFor('Evenement')(activite),
      [
        ...[activite.typeAnimation]
          .map(
            (typeAnimation) =>
              TYPE_ANIMATION_OPTIONS.find(valueMatch(typeAnimation))?.label,
          )
          .map(toAutre(activite.typeAnimationAutre)),
        ...[activite.typeEvenement]
          .map(
            (typeEvenement) =>
              TYPE_EVENEMENT_OPTIONS.find(valueMatch(typeEvenement))?.label,
          )
          .map(toAutre(activite.typeEvenementAutre)),
        ...activite.naturePartenariat
          .map(
            (naturePartenariat) =>
              NATURE_OPTIONS.find(valueMatch(naturePartenariat))?.label,
          )
          .map(toAutre(activite.naturePartenariatAutre)),
      ]
        .filter(Boolean)
        .join(intraCellLineBreak),
      activite.organisateurs
        .map(
          (organisateur) =>
            ORGANISATEURS_OPTIONS.find(valueMatch(organisateur))?.label,
        )
        .filter(Boolean)
        .join(intraCellLineBreak) || emptyFor('Evenement')(activite),
      activite.structuresPartenaires
        ?.map(({ nom }) => nom)
        .filter(Boolean)
        .join(intraCellLineBreak) || emptyFor('Partenariat')(activite),
      activite.structuresPartenaires
        ?.map(
          ({ type }) =>
            TYPE_DE_STRUCTURE_PARTENAIRE_OPTIONS.find(valueMatch(type))?.label,
        )
        .filter(Boolean)
        .join(intraCellLineBreak) || emptyFor('Partenariat')(activite),
      ECHELON_TERRITORIAL_OPTIONS.find(valueMatch(activite.echelonTerritorial))
        ?.label || emptyFor('Evenement', 'Partenariat')(activite),
      INITIATIVE_OPTIONS.find(valueMatch(activite.initiative))?.label ||
        emptyFor('Animation')(activite),
      activite.thematiquesAnimation
        .map(
          (thematiqueAnimation) =>
            THEMATIQUE_ANIMATION_OPTIONS.find(valueMatch(thematiqueAnimation))
              ?.label,
        )
        .map(toAutre(activite.thematiqueAnimationAutre))
        .filter(Boolean)
        .join(intraCellLineBreak) || emptyFor('Animation')(activite),
      activite.tags.map(({ tag: { nom } }) => nom).join(intraCellLineBreak),
      activite.notes ? htmlToText(activite.notes) : '',
      format(activite.creation, "dd/MM/yyyy 'à' HH:mm", { locale: fr }),
      isEqual(activite.creation, activite.modification)
        ? ''
        : format(activite.modification, "dd/MM/yyyy 'à' HH:mm", {
            locale: fr,
          }),
      activite.id,
    ]),
  })

  const dateColumnIndex = 1
  worksheet
    .getColumn(dateColumnIndex)
    .eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber >= tableStartRowNumber && cell.value) {
        cell.numFmt = 'dd/mm/yyyy' // Set date format only for rows starting from tableStartRowNumber
      }
    })

  worksheet.eachRow((row) => {
    row.alignment = { wrapText: true, vertical: 'top' }
  })

  autosizeColumns(worksheet)

  return workbook
}
