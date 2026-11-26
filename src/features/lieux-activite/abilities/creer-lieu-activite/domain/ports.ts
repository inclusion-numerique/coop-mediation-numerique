import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { Lieu } from '../../../domain/lieu'

export type EnregistrerLieuActivite = (entree: {
  readonly lieu: Lieu
  readonly mediateurId: MediateurId
}) => Promise<LieuId>

export type CreerLieuActivitePorts = {
  readonly enregistrer: EnregistrerLieuActivite
}
