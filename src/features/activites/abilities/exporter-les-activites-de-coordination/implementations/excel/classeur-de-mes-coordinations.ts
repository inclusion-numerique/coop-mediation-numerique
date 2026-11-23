import { CoordinateurId, criteresDesCoordinations } from '../../../../domain'
import { tagsUtilisablesDepuis } from '../../../../domain/fournisseurs-de-la-saisie'
import { tagsRappeles } from '../../domain/tags-rappeles'
import { parametresDeLaRecherche } from '../../ui/presenters/parametres-de-la-recherche.search-params'
import { exporterLesActivitesDeCoordination } from '../prisma/activites-a-exporter.query'
import { classeurDesCoordinations } from './classeur-des-coordinations'

export const classeurDeMesCoordinations = async ({
  recherche,
  coordinateurId,
  auteur,
  fuseau,
  tagsVisibles,
}: {
  readonly recherche: URLSearchParams
  readonly coordinateurId: string
  readonly auteur: Parameters<typeof classeurDesCoordinations>[0]['auteur']
  readonly fuseau: string
  readonly tagsVisibles: Parameters<typeof tagsUtilisablesDepuis>[0]
}) => {
  const criteres = criteresDesCoordinations(parametresDeLaRecherche(recherche))

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
