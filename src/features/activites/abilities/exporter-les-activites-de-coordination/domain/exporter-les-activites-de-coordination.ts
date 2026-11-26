import { type Result, success } from '@/libraries/result'
import type {
  ActiviteDeCoordination,
  CoordinateurId,
  CriteresDesCoordinations,
  TagDeLActivite,
} from '../../../domain'
import type { ExporterLesActivitesDeCoordinationPorts } from './ports'

export type ExportDesActivitesDeCoordination = {
  readonly activites: readonly ActiviteDeCoordination[]
  readonly tags: readonly TagDeLActivite[]
}

export const exporterLesActivitesDeCoordination =
  ({
    activitesAExporter,
    tagsUtilisables,
  }: ExporterLesActivitesDeCoordinationPorts) =>
  async ({
    coordinateurId,
    criteres,
  }: {
    readonly coordinateurId: CoordinateurId
    readonly criteres: CriteresDesCoordinations
  }): Promise<Result<ExportDesActivitesDeCoordination, never>> => {
    const [activites, tags] = await Promise.all([
      activitesAExporter({ coordinateurId, criteres }),
      criteres.tags.length === 0 ? [] : tagsUtilisables(criteres.tags),
    ])
    return success({ activites, tags })
  }
