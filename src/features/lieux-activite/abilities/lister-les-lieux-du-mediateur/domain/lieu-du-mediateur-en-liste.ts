import type { RattachementId } from '../../../domain/identifiants/rattachement-id'
import type { LieuEnListe } from '../../../domain/lieu-en-liste'

export type LieuDuMediateurEnListe = {
  readonly id: RattachementId
  readonly debut: Date
  readonly lieuInclusion: LieuEnListe
}
