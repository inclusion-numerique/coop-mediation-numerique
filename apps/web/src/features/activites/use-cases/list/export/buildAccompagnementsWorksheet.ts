import {
  genreLabels,
  statutSocialLabels,
  trancheAgeLabels,
} from '@app/web/beneficiaire/beneficiaire'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import {
  addExportMetadata,
  WorksheetUser,
} from '@app/web/libs/worksheet/addExportMetadata'
import { autosizeColumns } from '@app/web/libs/worksheet/autosizeColumns'
import { setWorkbookMetadata } from '@app/web/libs/worksheet/setWorkbookMetadata'
import { htmlToText } from '@app/web/utils/htmlToText'
import { booleanToYesNoLabel } from '@app/web/utils/yesNoBooleanOptions'
import { addFilters } from '@app/web/worksheet/buildWorksheetHelpers'
import { format, isEqual } from 'date-fns'
import { fr } from 'date-fns/locale'
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
import type { ActiviteListItemWithTimezone } from '../db/activitesQueries'

export type BuildActivitesWorksheetInput = {
  // This is the user that requested the worksheet, it might not be the same user as the one that owns the activites
  user: WorksheetUser
  // This is the user that owns the activites
  mediateur: WorksheetUser
  filters: ActivitesFiltersLabels
  activites: Omit<ActiviteListItemWithTimezone, 'rdv'>[]
  worksheetGenerationDate?: Date // Defaults to current date
  hasCraV1: boolean
}

const intraCellLineBreak = '\n'

export const buildAccompagnementsWorksheet = (
  {
    activites,
    user,
    filters,
    mediateur,
    worksheetGenerationDate = new Date(),
    hasCraV1,
  }: BuildActivitesWorksheetInput,
  isSelfExport: boolean,
): Excel.Workbook => {
  const workbook = new Excel.Workbook()

  setWorkbookMetadata(workbook)

  const worksheet = workbook.addWorksheet('Activités')

  addExportMetadata(worksheet)({
    user,
    date: worksheetGenerationDate,
    total: activites.flatMap((activite) => activite.accompagnements).length,
  })

  addFilters(worksheet)(filters, {
    // only display the mediateur name if the user is NOT the mediateur used for export
    mediateurScope: user.id === mediateur.id ? null : mediateur,
  })

  const activitesTableHeaders = [
    'Date',
    'Enregistré le',
    'Dernière modification le',
    ...(!isSelfExport
      ? ['Prénom du médiateur', 'Nom du médiateur', 'Rôle', 'ID - Conum']
      : []),
    'Type',
    'Participants',
    ...(isSelfExport ? ['Bénéficiaire'] : []),
    'Canaux d’accompagnement',
    'Nom du lieu',
    'Adresse',
    'Commune',
    'Code postal',
    'Code Insee',
    'Durée (min)',
    'Nom de l’atelier',
    'Matériel numérique utilisé',
    'Thématique(s) d’accompagnement',
    'Tags',
    'Nom de la démarche administrative',
    'Niveau d’autonomie (ou de l’atelier)',
    'Bénéficiaire réorienté',
    'Structure de redirection',
    'Commune du bénéficiaire',
    'Code postal du bénéficiaire',
    'Code Insee du bénéficiaire',
    'Genre du bénéficiaire',
    'Tranche d’âge du bénéficiaire',
    'Statut du bénéficiaire',
    ...(isSelfExport ? ['Notes supplémentaires'] : []),
    ...(hasCraV1 ? ['Source de la donnée'] : []),
    'ID CRA',
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
    rows: activites.flatMap((activite) => {
      const {
        date,
        creation,
        modification,
        type,
        typeLieu,
        lieuCommune,
        lieuCodePostal,
        lieuCodeInsee,
        structure,
        duree,
        titreAtelier,
        materiel,
        thematiques,
        tags,
        precisionsDemarche,
        autonomie,
        niveau,
        notes,
        orienteVersStructure,
        structureDeRedirection,
        id,
        mediateur,
      } = activite

      return activite.accompagnements.map((accompagnement, index) => {
        return [
          date,
          format(creation, "dd/MM/yyyy 'à' HH:mm", { locale: fr }),
          isEqual(creation, modification)
            ? ''
            : format(modification, "dd/MM/yyyy 'à' HH:mm", { locale: fr }),
          ...(!isSelfExport
            ? [
                mediateur.user.firstName,
                mediateur.user.lastName,
                mediateur.conseillerNumerique == null
                  ? 'Médiateur'
                  : 'Conseiller Numérique',
                mediateur.conseillerNumerique?.id ?? '',
              ]
            : []),
          typeActiviteLabels[type],
          activite.accompagnements.length === 1
            ? 1
            : `${index + 1}/${activite.accompagnements.length}`,
          ...(isSelfExport
            ? [getBeneficiaireDisplayName(accompagnement.beneficiaire)]
            : []),
          typeLieuLabels[typeLieu],
          structure?.nom ?? '',
          structure?.adresse ?? '',
          structure?.commune ?? lieuCommune ?? '',
          structure?.codePostal ?? lieuCodePostal ?? '',
          structure?.codeInsee ?? lieuCodeInsee ?? '',
          duree,
          titreAtelier || '',
          materiel
            .map((materielValue) => materielLabels[materielValue])
            .join(intraCellLineBreak),
          thematiques
            .map((thematique) => thematiqueLabels[thematique])
            .join(intraCellLineBreak),
          tags.map(({ tag: { nom } }) => nom).join(intraCellLineBreak),
          precisionsDemarche || '',
          autonomie
            ? `${autonomieStars[autonomie]}/${autonomieValues.length}`
            : niveau
              ? `${niveauAtelierStars[niveau]}/${niveauAtelierValues.length}`
              : '',
          orienteVersStructure === null
            ? ''
            : booleanToYesNoLabel(orienteVersStructure),
          structureDeRedirection
            ? structuresRedirectionLabels[structureDeRedirection]
            : '',
          accompagnement.beneficiaire.commune ?? '',
          accompagnement.beneficiaire.communeCodePostal ?? '',
          accompagnement.beneficiaire.communeCodeInsee ?? '',
          genreLabels[accompagnement.beneficiaire.genre ?? 'NonCommunique'],
          trancheAgeLabels[
            accompagnement.beneficiaire.trancheAge ?? 'NonCommunique'
          ],
          statutSocialLabels[
            accompagnement.beneficiaire.statutSocial ?? 'NonCommunique'
          ],
          ...(isSelfExport
            ? [notes && index === 0 ? htmlToText(notes) : '']
            : []),
          ...(hasCraV1
            ? [
                activite.v1CraId
                  ? 'Espace coop (V1)'
                  : 'La Coop de la médiation numérique (V2)',
              ]
            : []),
          id,
        ]
      })
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
