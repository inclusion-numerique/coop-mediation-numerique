import {
  CoordinateurId,
  type CriteresDesCoordinations,
} from '../../../../domain'
import { tagsUtilisablesDepuis } from '../../../../domain/fournisseurs-de-la-saisie'
import { tagsRappeles } from '../../domain/tags-rappeles'
import { exporterLesActivitesDeCoordination } from '../prisma/activites-a-exporter.query'
import { classeurDesCoordinations } from './classeur-des-coordinations'

export const classeurDeMesCoordinations = async ({
  criteres,
  coordinateurId,
  auteur,
  fuseau,
  tagsVisibles,
}: {
  readonly criteres: CriteresDesCoordinations
  readonly coordinateurId: string
  readonly auteur: Parameters<typeof classeurDesCoordinations>[0]['auteur']
  readonly fuseau: string
  readonly tagsVisibles: Parameters<typeof tagsUtilisablesDepuis>[0]
}) => {
  const [activites, tags] = await Promise.all([
    exporterLesActivitesDeCoordination({
      coordinateurId: CoordinateurId(coordinateurId),
      criteres,
    }),
    tagsRappeles({
      criteres,
      tagsUtilisables: tagsUtilisablesDepuis(tagsVisibles),
    }),
  ])

  return classeurDesCoordinations({
    activites,
    criteres,
    tags,
    auteur,
    fuseau,
  })
}
