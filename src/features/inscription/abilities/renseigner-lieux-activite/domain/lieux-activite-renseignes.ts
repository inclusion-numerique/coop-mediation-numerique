import type { InscriptionEnCours } from '@/features/inscription/domain'
import type { LieuDesire } from './lieu-soumis'
import type { RattachementId } from './rattachement-id'

export type LieuxActiviteRenseignes<Adresse, Destination> = {
  readonly etatFranchi: InscriptionEnCours
  readonly aCloturer: readonly RattachementId[]
  readonly aCreer: readonly LieuDesire<Adresse>[]
  readonly destinations: readonly Destination[]
}
