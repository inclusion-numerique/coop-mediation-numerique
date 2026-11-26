import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { Lieu } from '../../../domain/lieu'

export type LieuCree = {
  readonly id: LieuId
  readonly lieu: Lieu
  readonly mediateurId: MediateurId
}
