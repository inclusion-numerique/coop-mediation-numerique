import type {
  ActiviteDeCoordination,
  ActiviteDeCoordinationId,
} from '../../../domain'

export type ActiviteEnregistree = {
  readonly id: ActiviteDeCoordinationId
  readonly type: ActiviteDeCoordination['_tag']
}

export const activiteEnregistree = ({
  activite,
}: {
  readonly activite: Pick<ActiviteDeCoordination, 'id' | '_tag'>
}): ActiviteEnregistree => ({ id: activite.id, type: activite._tag })
