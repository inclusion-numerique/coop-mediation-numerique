import {
  CoordinateurId,
  criteresDesCoordinations,
  estFiltre,
  type ParametresDesCoordinations,
  paginationLue,
} from '../../../domain'
import { filtresActifsDesCoordinations } from '../../../ui/filtres-actifs-des-coordinations'
import { listeDesCoordinations } from '../ui/liste-des-coordinations.presenter'
import { optionsDeFiltrePresentees } from '../ui/options-de-filtre.presenter'
import { parametresDeLaPagination } from '../ui/pagination.presenter'
import { sousTitreDeMesCoordinations } from '../ui/sous-titre.presenter'
import { listerLesActivitesDeCoordination } from './prisma/activites-de-coordination.query'
import { optionsDeFiltre } from './prisma/options-de-filtre.query'

export const mesActivitesDeCoordination = async ({
  coordinateurId,
  parametres,
  timezone,
  aussiMediateur,
  aujourdhui = new Date(),
}: {
  readonly coordinateurId: string
  readonly parametres: ParametresDesCoordinations & {
    readonly page?: string
    readonly lignes?: string
  }
  readonly timezone: string
  readonly aussiMediateur: boolean
  readonly aujourdhui?: Date
}) => {
  const coordinateur = CoordinateurId(coordinateurId)
  const criteres = criteresDesCoordinations(parametres)
  const pagination = paginationLue(parametres)

  const [listees, options] = await Promise.all([
    listerLesActivitesDeCoordination({
      coordinateurId: coordinateur,
      criteres,
      pagination,
    }),
    optionsDeFiltre({ coordinateurId: coordinateur }),
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
