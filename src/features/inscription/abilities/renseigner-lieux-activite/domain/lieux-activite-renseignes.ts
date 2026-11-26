import type { InscriptionEnCours } from '@/features/inscription/domain'
import type { LieuActiviteInput } from './reconcilier'

export type LieuxActiviteRenseignes = {
  readonly etatFranchi: InscriptionEnCours
  readonly aCloturer: readonly string[]
  readonly aCreer: readonly LieuActiviteInput[]
}
