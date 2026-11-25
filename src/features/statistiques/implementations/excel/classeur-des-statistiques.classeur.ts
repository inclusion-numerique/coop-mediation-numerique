import * as Excel from 'exceljs'
import { Worksheet } from 'exceljs'
import { numberToPercentage } from '@/libraries/nombre'
import type { LabelAndCount, QuantifiedShare } from '@/libraries/proportions'
import {
  type AuteurDExport,
  addExportMetadata,
  addFilters,
  addTitleRow,
  autosizeColumns,
  setWorkbookMetadata,
} from '@/libraries/tableur'

const filtresDisponibles = [
  'Période',
  'Source',
  'Lieux d’accompagnement',
  'Communes',
  'Départements',
  'Type d’accompagnement',
  'Rôle',
  'Thématiques non administratives',
  'Thématiques administratives',
  'Tags',
].map((label) => ({ label, type: label }))

const filtresDesMediateurs = {
  label: 'Médiateurs',
  type: 'Médiateurs',
  masqueSiVide: true,
}

type PartDuTotal = { total: number; proportion: number }

type CommuneDuClasseur = QuantifiedShare & {
  commune: string | null
  codePostal: string | null
}

type StatistiquesDuClasseur = {
  totalCounts: {
    activites: {
      total: number
      individuels: PartDuTotal
      collectifs: PartDuTotal & { participants: number }
    }
    accompagnements: { total: number }
    beneficiaires: {
      total: number
      nouveaux: number
      suivis: number
      anonymes: number
    }
  }
  accompagnementsParMois: LabelAndCount[]
  activites: {
    thematiques: QuantifiedShare[]
    thematiquesDemarches: QuantifiedShare[]
    tags: QuantifiedShare[]
    materiels: QuantifiedShare[]
    typeLieu: QuantifiedShare[]
    durees: QuantifiedShare[]
  }
  structures: QuantifiedShare[]
  communes: CommuneDuClasseur[]
  beneficiaires: {
    genres: QuantifiedShare[]
    trancheAges: QuantifiedShare[]
    statutsSocial: QuantifiedShare[]
    communes: QuantifiedShare[]
  }
}

const addStatistiquesGenerales =
  (worksheet: Excel.Worksheet) =>
  ({ totalCounts, accompagnementsParMois }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Statistiques générales')
    worksheet.addRow([
      'Accompagnements au total',
      totalCounts.accompagnements.total,
    ])
    worksheet.addRow([
      'Bénéficiaires accompagnés',
      totalCounts.beneficiaires.total,
    ])
    if (totalCounts.beneficiaires.nouveaux > 0) {
      worksheet.addRow([
        'Nouveaux bénéficiaires',
        totalCounts.beneficiaires.nouveaux,
      ])
    }
    worksheet.addRow(['Bénéficiaires suivis', totalCounts.beneficiaires.suivis])
    worksheet.addRow([
      'Bénéficiaires anonymes',
      totalCounts.beneficiaires.anonymes,
    ])
    worksheet.addRow([
      'Accompagnements sur les 12 derniers mois',
      ...accompagnementsParMois.map(({ label }) => label),
    ])
    worksheet.addRow(['', ...accompagnementsParMois.map(({ count }) => count)])
    worksheet.addRow([])
  }

const addStatistiquesActivites =
  (worksheet: Excel.Worksheet) =>
  ({ totalCounts: { activites } }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Statistiques sur vos accompagnements')
    worksheet.addRow([
      'Accompagnements individuels',
      activites.individuels.total,
      numberToPercentage(activites.individuels.proportion),
    ])
    worksheet.addRow([
      'Ateliers collectifs',
      activites.collectifs.total,
      numberToPercentage(activites.collectifs.proportion),
    ])
    worksheet.addRow([
      'Nombre total de participants aux ateliers',
      activites.collectifs.participants,
    ])
    worksheet.addRow(['Nombre total d’activités', activites.total])
    worksheet.addRow([])
  }

const addQuantifiedShareRows = (
  worksheet: Worksheet,
  items: QuantifiedShare[],
) => {
  worksheet.addRows(
    items.map(({ label, count, proportion }) => [
      label,
      count,
      numberToPercentage(proportion),
    ]),
  )
}

const addStatistiquesThematiquesMediationNumerique =
  (worksheet: Excel.Worksheet) =>
  ({ activites: { thematiques } }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Thématiques Médiation numérique')
    addQuantifiedShareRows(worksheet, thematiques)
    worksheet.addRow([])
  }

const addStatistiquesThematiquesDemarchesAdministratives =
  (worksheet: Excel.Worksheet) =>
  ({ activites: { thematiquesDemarches } }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Thématiques Démarches administratives')
    addQuantifiedShareRows(worksheet, thematiquesDemarches)
    worksheet.addRow([])
  }

const addStatistiquesTags =
  (worksheet: Excel.Worksheet) =>
  ({ activites: { tags } }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Tags')
    addQuantifiedShareRows(worksheet, tags)
    worksheet.addRow([])
  }

const addStatistiquesMaterielUtilises =
  (worksheet: Excel.Worksheet) =>
  ({ activites: { materiels } }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Matériel utilisés')
    addQuantifiedShareRows(worksheet, materiels)
    worksheet.addRow([])
  }

const addStatistiquesCanauxActivites =
  (worksheet: Excel.Worksheet) =>
  ({ activites: { typeLieu } }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Canaux des activités')
    addQuantifiedShareRows(worksheet, typeLieu)
    worksheet.addRow([])
  }

const addStatistiquesDureesActivites =
  (worksheet: Excel.Worksheet) =>
  ({ activites: { durees } }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Durées des activités')
    addQuantifiedShareRows(worksheet, durees)
    worksheet.addRow([])
  }

const addStatistiquesNombreActivitesParLieux =
  (worksheet: Excel.Worksheet) =>
  ({ structures }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Nombre d’activités par lieux')
    addQuantifiedShareRows(worksheet, structures)
    worksheet.addRow([])
  }

const addStatistiquesNombreAccompagnementsParCodePostal =
  (worksheet: Excel.Worksheet) =>
  ({ communes }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Nombre d’accompagnements par code postal')
    worksheet.addRows(
      communes.map(({ commune, codePostal, count, proportion }) => [
        commune ?? 'Non communiqué',
        codePostal ?? '',
        count,
        numberToPercentage(proportion),
      ]),
    )
    worksheet.addRow([])
  }

const addStatistiquesGenre =
  (worksheet: Excel.Worksheet) =>
  ({ beneficiaires: { genres } }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Genre')
    addQuantifiedShareRows(worksheet, genres)
    worksheet.addRow([])
  }

const addStatistiquesTranchesAge =
  (worksheet: Excel.Worksheet) =>
  ({ beneficiaires: { trancheAges } }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Tranches d’âge')
    addQuantifiedShareRows(worksheet, trancheAges)
    worksheet.addRow([])
  }

const addStatistiquesStatus =
  (worksheet: Excel.Worksheet) =>
  ({ beneficiaires: { statutsSocial } }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Statuts')
    addQuantifiedShareRows(worksheet, statutsSocial)
    worksheet.addRow([])
  }

const addStatistiquesCommuneResidenceBeneficiaires =
  (worksheet: Excel.Worksheet) =>
  ({ beneficiaires: { communes } }: StatistiquesDuClasseur) => {
    addTitleRow(worksheet)('Commune de résidence des bénéficiaires')
    addQuantifiedShareRows(worksheet, communes)
    worksheet.addRow([])
  }

export type EntreeDuClasseurDesStatistiques = {
  auteur: AuteurDExport
  filters: Parameters<ReturnType<typeof addFilters>>[0]
  statistiques: StatistiquesDuClasseur
  fuseau: string
  worksheetGenerationDate?: Date
}

export const classeurDesStatistiques = ({
  auteur,
  filters,
  statistiques,
  fuseau,
  worksheetGenerationDate = new Date(),
}: EntreeDuClasseurDesStatistiques): Excel.Workbook => {
  const workbook = new Excel.Workbook()

  setWorkbookMetadata(workbook)

  const worksheet = workbook.addWorksheet('Statistiques')

  addExportMetadata(worksheet)({
    auteur,
    date: worksheetGenerationDate,
    fuseau,
  })
  addTitleRow(worksheet)('Filtres')
  addFilters(worksheet, [...filtresDisponibles, filtresDesMediateurs])(filters)
  worksheet.addRow([])
  addStatistiquesGenerales(worksheet)(statistiques)
  addStatistiquesActivites(worksheet)(statistiques)
  addStatistiquesThematiquesMediationNumerique(worksheet)(statistiques)
  addStatistiquesThematiquesDemarchesAdministratives(worksheet)(statistiques)
  addStatistiquesTags(worksheet)(statistiques)
  addStatistiquesMaterielUtilises(worksheet)(statistiques)
  addStatistiquesCanauxActivites(worksheet)(statistiques)
  addStatistiquesDureesActivites(worksheet)(statistiques)
  addStatistiquesNombreActivitesParLieux(worksheet)(statistiques)
  addStatistiquesNombreAccompagnementsParCodePostal(worksheet)(statistiques)
  addTitleRow(worksheet)('Statistiques sur vos bénéficiaires')
  addStatistiquesGenre(worksheet)(statistiques)
  addStatistiquesTranchesAge(worksheet)(statistiques)
  addStatistiquesStatus(worksheet)(statistiques)
  addStatistiquesCommuneResidenceBeneficiaires(worksheet)(statistiques)

  autosizeColumns(worksheet)

  return workbook
}
