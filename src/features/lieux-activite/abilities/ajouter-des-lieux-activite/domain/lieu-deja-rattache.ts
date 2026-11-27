import type { IdentifiantCartographie } from '../../../domain/cartographie-nationale/ids-cartographie-nationale'
import type { LieuId } from '../../../domain/identifiants/lieu-id'

export type LieuDejaRattache = {
  readonly id: LieuId
  readonly structureCartographieNationaleId: IdentifiantCartographie | null
}
