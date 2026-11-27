import type { ReglageDuPartage } from './reglage-du-partage'

export type EnregistrerLeReglageDuPartage = (
  reglage: ReglageDuPartage,
) => Promise<void>

export type ReglerLePartageStatistiquesPorts = {
  readonly enregistrer: EnregistrerLeReglageDuPartage
}
