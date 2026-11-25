import { lectureDeLaPagination } from '@/features/activites/ui/filtres/liste-des-activites.filtre'
import {
  CoordinateurId,
  type CriteresDesCoordinations,
  estFiltre,
  type Pagination,
} from '../../../../domain'
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
  criteres,
  timezone,
  aussiMediateur,
  lectures,
  aujourdhui = new Date(),
}: {
  readonly coordinateurId: string
  readonly parametres: Readonly<Partial<Record<string, string>>>
  readonly criteres: CriteresDesCoordinations
  readonly timezone: string
  readonly aussiMediateur: boolean
  readonly lectures: LecturesDeMesCoordinations
  readonly aujourdhui?: Date
}) => {
  const coordinateur = CoordinateurId(coordinateurId)
  const { pagination } = lectureDeLaPagination(parametres)

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
      liste: listeDesCoordinations({
        listees,
        filtre: estFiltre(criteres),
        timezone,
      }),
      filtre: estFiltre(criteres),
      pagination: parametresDeLaPagination(parametres),
      lignesParPage: pagination.pageSize,
    },
  }
}
