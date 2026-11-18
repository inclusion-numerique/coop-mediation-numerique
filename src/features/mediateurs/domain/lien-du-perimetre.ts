import type { LienDePartageId } from './lien-de-partage-id'
import type { PerimetrePartage } from './perimetre-partage'

export type LienDuPerimetre = {
  readonly perimetre: PerimetrePartage
  readonly lien: LienDePartageId | null
}
