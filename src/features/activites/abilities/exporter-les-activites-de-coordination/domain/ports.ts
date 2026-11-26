import type {
  ActiviteDeCoordination,
  CoordinateurId,
  CriteresDesCoordinations,
  TagsUtilisables,
} from '../../../domain'

export type ActivitesAExporter = (demande: {
  readonly coordinateurId: CoordinateurId
  readonly criteres: CriteresDesCoordinations
}) => Promise<readonly ActiviteDeCoordination[]>

export type ExporterLesActivitesDeCoordinationPorts = {
  readonly activitesAExporter: ActivitesAExporter
  readonly tagsUtilisables: TagsUtilisables
}
