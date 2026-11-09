import type { LieuEnListe } from '../../../domain/lieu-en-liste'

export type LieuDuMediateurEnListe = {
  readonly id: string
  readonly debut: Date
  readonly lieuInclusion: LieuEnListe
}
