import {
  type ActiviteDeCoordination,
  CoordinateurId,
  type CriteresDesCoordinations,
  type TagDeLActivite,
} from '../../../../domain'
import { tagsUtilisablesDepuis } from '../../../../domain/fournisseurs-de-la-saisie'
import { tagsRappeles } from '../../domain/tags-rappeles'
import { exporterLesActivitesDeCoordination } from '../prisma/activites-a-exporter.query'
import { classeurDesCoordinations } from './classeur-des-coordinations.classeur'

type Presenter = (donnees: {
  activites: readonly ActiviteDeCoordination[]
  criteres: CriteresDesCoordinations
  tags: readonly TagDeLActivite[]
  fuseau: string
}) => Omit<
  Parameters<typeof classeurDesCoordinations>[0],
  'auteur' | 'fuseau' | 'genereLe'
>

export const classeurDeMesCoordinations = async ({
  criteres,
  coordinateurId,
  auteur,
  fuseau,
  tagsVisibles,
  presenter,
}: {
  readonly criteres: CriteresDesCoordinations
  readonly coordinateurId: string
  readonly auteur: Parameters<typeof classeurDesCoordinations>[0]['auteur']
  readonly fuseau: string
  readonly tagsVisibles: Parameters<typeof tagsUtilisablesDepuis>[0]
  readonly presenter: Presenter
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
    ...presenter({ activites, criteres, tags, fuseau }),
    auteur,
    fuseau,
  })
}
