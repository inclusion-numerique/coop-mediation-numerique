import type { LieuEnListe } from '../../../domain/lieu-en-liste'
import type { RattachementId } from '../../../domain/rattachement-id'

export type LieuDuMediateurEnListe = {
  readonly id: RattachementId
  readonly debut: Date
  readonly lieuInclusion: LieuEnListe
}
