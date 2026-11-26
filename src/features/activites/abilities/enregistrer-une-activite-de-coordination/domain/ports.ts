import type {
  ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  CoordinateurId,
  TagsUtilisables,
  TypeDActiviteDeCoordination,
} from '../../../domain'

export type ActiviteDeCoordinationExistante = {
  readonly type: TypeDActiviteDeCoordination
  readonly creation: Date
}

export type ActiviteDeCoordinationDuCoordinateur = (criteres: {
  readonly id: ActiviteDeCoordinationId
  readonly coordinateurId: CoordinateurId
}) => Promise<ActiviteDeCoordinationExistante | null>

export type NouvelIdentifiantDeCoordination = () => ActiviteDeCoordinationId

export type EcrireLActiviteDeCoordination = (
  activite: ActiviteDeCoordination,
) => Promise<void>

export type EnregistrerUneActiviteDeCoordinationPorts = {
  readonly activiteDuCoordinateur: ActiviteDeCoordinationDuCoordinateur
  readonly nouvelIdentifiant: NouvelIdentifiantDeCoordination
  readonly tagsUtilisables: TagsUtilisables
  readonly creer: EcrireLActiviteDeCoordination
  readonly modifier: EcrireLActiviteDeCoordination
}
