import {
  genreLabels,
  statutSocialLabels,
  trancheAgeLabels,
} from '@app/web/beneficiaire/beneficiaire'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import {
  WorksheetUser,
  addExportMetadata,
} from '@app/web/libs/worksheet/addExportMetadata'
import { autosizeColumns } from '@app/web/libs/worksheet/autosizeColumns'
import { setWorkbookMetadata } from '@app/web/libs/worksheet/setWorkbookMetadata'
import { htmlToText } from '@app/web/utils/htmlToText'
import { booleanToYesNoLabel } from '@app/web/utils/yesNoBooleanOptions'
import { addFilters } from '@app/web/worksheet/buildWorksheetHelpers'
import * as Excel from 'exceljs'
import {
  niveauAtelierStars,
  niveauAtelierValues,
} from '../../cra/collectif/fields/niveau-atelier'
import { materielLabels } from '../../cra/fields/materiel'
import { thematiqueLabels } from '../../cra/fields/thematique'
import { typeActiviteLabels } from '../../cra/fields/type-activite'
import { typeLieuLabels } from '../../cra/fields/type-lieu'
import {
  autonomieStars,
  autonomieValues,
} from '../../cra/individuel/fields/autonomie'
import { structuresRedirectionLabels } from '../../cra/individuel/fields/structures-redirection'
import type { ActivitesFiltersLabels } from '../components/generateActivitesFiltersLabels'
import type { ActiviteListItem } from '../db/activitesQueries'

export type BuildActivitesWorksheetInput = {
  // This is the user that requested the worksheet, it might not be the same user as the one that owns the activites
  user: WorksheetUser
  // This is the user that owns the activites
  mediateur: WorksheetUser
  filters: ActivitesFiltersLabels
  activites: ActiviteListItem[]
  worksheetGenerationDate?: Date // Defaults to current date
}

const intraCellLineBreak = '\n'

const beneficiairesListCellFormatter =
  (activite: ActiviteListItem) =>
  (
    toStringValue: (
      beneficiaire: ActiviteListItem['accompagnements'][number]['beneficiaire'],
    ) => string,
  ) =>
    activite.accompagnements
      .map((accompagnement) => accompagnement.beneficiaire)
      .map(toStringValue)
      .join(intraCellLineBreak)

export const buildActivitesWorksheet = ({
  activites,
  user,
  filters,
  mediateur,
  worksheetGenerationDate = new Date(),
}: BuildActivitesWorksheetInput): Excel.Workbook => {
  const workbook = new Excel.Workbook()

  setWorkbookMetadata(workbook)

  const worksheet = workbook.addWorksheet('Activités')

  addExportMetadata(worksheet)({
    user,
    date: worksheetGenerationDate,
    total: activites.length,
  })

  addFilters(worksheet)(filters, {
    // only display the mediateur name if the user is NOT the mediateur used for export
    mediateurScope: user.id === mediateur.id ? null : mediateur,
    excludeFilters: ['conseiller_numerique'],
  })

  const activitesTableHeaders = [
    'Date',
    'Type',
    'Nombre de participants',
    'Bénéficiaire',
    'Canaux d’accompagnement',
    'Lieu',
    'Durée (min)',
    'Nom de l’atelier',
    'Matériel numérique utilisé',
    'Thématique(s) d’accompagnement',
    'Nom de la démarche administrative',
    'Niveau d’autonomie du bénéficiaire',
    'Niveau de l’atelier',
    'Le bénéficiaire est-il orienté vers une autre structure ?',
    'Structure de redirection',
    'Commune de résidence du bénéficiaire',
    'Genre du bénéficiaire',
    'Tranche d’âge du bénéficiaire',
    'Statut du bénéficiaire',
    'Notes supplémentaires',
  ]

  const separatorRowBeforeTable = worksheet.addRow([''])

  const tableStartRowNumber = separatorRowBeforeTable.number + 1

  worksheet.addTable({
    name: 'Activités',
    ref: `A${tableStartRowNumber}`,
    headerRow: true,
    totalsRow: false,
    columns: activitesTableHeaders.map((label) => ({
      name: label,
      filterButton: true,
    })),
    rows: activites.map((activite) => {
      const beneficiairesListCell = beneficiairesListCellFormatter(activite)
      const {
        date,
        type,
        typeLieu,
        lieuCommune,
        lieuCodePostal,
        structure,
        duree,
        titreAtelier,
        materiel,
        thematiques,
        precisionsDemarche,
        autonomie,
        niveau,
        notes,
        orienteVersStructure,
        structureDeRedirection,
      } = activite

      return [
        date,
        typeActiviteLabels[type],
        activite.accompagnements.length,
        beneficiairesListCell(getBeneficiaireDisplayName),
        typeLieuLabels[typeLieu],
        structure
          ? `${structure.nom}, ${structure.codePostal} ${structure.commune}`
          : lieuCommune
            ? `${lieuCodePostal} ${lieuCommune}`
            : '',
        duree,
        titreAtelier || '',
        materiel
          .map((materielValue) => materielLabels[materielValue])
          .join(intraCellLineBreak),
        thematiques
          .map((thematique) => thematiqueLabels[thematique])
          .join(intraCellLineBreak),
        precisionsDemarche || '',
        autonomie
          ? `${autonomieStars[autonomie]}/${autonomieValues.length}`
          : '',
        niveau
          ? `${niveauAtelierStars[niveau]}/${niveauAtelierValues.length}`
          : '',
        orienteVersStructure === null
          ? ''
          : booleanToYesNoLabel(orienteVersStructure),
        structureDeRedirection
          ? structuresRedirectionLabels[structureDeRedirection]
          : '',
        beneficiairesListCell(({ commune, communeCodePostal }) =>
          commune ? `${communeCodePostal} ${commune}` : '-',
        ),
        beneficiairesListCell(
          ({ genre }) => genreLabels[genre ?? 'NonCommunique'],
        ),
        beneficiairesListCell(
          ({ trancheAge }) => trancheAgeLabels[trancheAge ?? 'NonCommunique'],
        ),
        beneficiairesListCell(
          ({ statutSocial }) =>
            statutSocialLabels[statutSocial ?? 'NonCommunique'],
        ),
        notes ? htmlToText(notes) : '',
      ]
    }),
  })

  const dateColumnIndex = 1
  worksheet
    .getColumn(dateColumnIndex)
    .eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber >= tableStartRowNumber && cell.value) {
        cell.numFmt = 'dd/mm/yyyy' // Set date format only for rows starting from tableStartRowNumber
      }
    })

  // Ensure that the rows auto-adjust their height to fit the wrapped text and displays break lines
  worksheet.eachRow((row) => {
    row.alignment = { wrapText: true, vertical: 'top' }
  })

  autosizeColumns(worksheet)

  return workbook
}
