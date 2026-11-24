import {
  CoordinateurId,
  type CriteresDesCoordinations,
  criteresDesCoordinations,
  estFiltre,
  type Pagination,
  type ParametresDesCoordinations,
  paginationLue,
} from '../../../../domain'
import { filtresActifsDesCoordinations } from '../../../../ui/presenters/filtres-actifs-des-coordinations.presenter'
import type {
  ActivitesDeCoordinationListees,
  OptionsDeFiltre,
} from '../../domain'
import { listeDesCoordinations } from './liste-des-coordinations.presenter'
import { optionsDeFiltrePresentees } from './options-de-filtre.presenter'
import { parametresDeLaPagination } from './pagination.presenter'
import { sousTitreDeMesCoordinations } from './sous-titre.presenter'

export type LecturesDeMesCoordinations = {
  readonly activites: (demande: {
    readonly coordinateurId: CoordinateurId
    readonly criteres: CriteresDesCoordinations
    readonly pagination: Pagination
  }) => Promise<ActivitesDeCoordinationListees>
  readonly options: (demande: {
    readonly coordinateurId: CoordinateurId
  }) => Promise<OptionsDeFiltre>
}

export const mesActivitesDeCoordination = async ({
  coordinateurId,
  parametres,
  timezone,
  aussiMediateur,
  lectures,
  aujourdhui = new Date(),
}: {
  readonly coordinateurId: string
  readonly parametres: ParametresDesCoordinations & {
    readonly page?: string
    readonly lignes?: string
  }
  readonly timezone: string
  readonly aussiMediateur: boolean
  readonly lectures: LecturesDeMesCoordinations
  readonly aujourdhui?: Date
}) => {
  const coordinateur = CoordinateurId(coordinateurId)
  const criteres = criteresDesCoordinations(parametres)
  const pagination = paginationLue(parametres)

  const [listees, options] = await Promise.all([
    lectures.activites({
      coordinateurId: coordinateur,
      criteres,
      pagination,
    }),
    lectures.options({ coordinateurId: coordinateur }),
  ])

  return {
    total: listees.total,
    page: {
      sousTitre: sousTitreDeMesCoordinations(aussiMediateur),
      options: optionsDeFiltrePresentees(options, aujourdhui),
      filtresActifs: filtresActifsDesCoordinations(criteres, options.tags),
      liste: listeDesCoordinations({
        listees,
        filtre: estFiltre(criteres),
        timezone,
      }),
      filtre: estFiltre(criteres),
      pagination: parametresDeLaPagination(parametres),
      lignesParPage: pagination.lignesParPage,
    },
  }
}
