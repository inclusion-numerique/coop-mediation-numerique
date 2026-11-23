import { CoordinateurId, criteresDesCoordinations } from '../../../domain'
import { tagsUtilisablesDepuis } from '../../../domain/fournisseurs-de-la-saisie'
import { parametresDeLaRecherche } from '../ui/parametres-de-la-recherche.presenter'
import { exporterLesActivitesDeCoordination } from './prisma/activites-a-exporter.query'
import { tagsRappeles } from './tags-rappeles'
import { classeurDesCoordinations } from './worksheet/classeur-des-coordinations'

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
