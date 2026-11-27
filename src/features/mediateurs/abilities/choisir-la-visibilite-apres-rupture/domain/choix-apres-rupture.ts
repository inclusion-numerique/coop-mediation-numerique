import type {
  AuteurId,
  MediateurId,
  RuptureEnAttente,
} from '@/features/mediateurs/domain'
import type { ReponseApresRupture } from './reponse-apres-rupture'

export type ChoixApresRupture = {
  readonly mediateurId: MediateurId
  readonly choixPrecedentLe: Date | null
  readonly reponse: ReponseApresRupture
  readonly visible: boolean
  readonly rupture: RuptureEnAttente
  readonly auteurId: AuteurId
  readonly choisiLe: Date
}
