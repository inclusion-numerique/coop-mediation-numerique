import type {
  AuteurId,
  ProprietairePartage,
} from '@/features/mediateurs/domain'

export type ReglageDuPartage = {
  readonly proprietaire: ProprietairePartage
  readonly actif: boolean
  readonly auteurId: AuteurId
  readonly regleLe: Date
}
