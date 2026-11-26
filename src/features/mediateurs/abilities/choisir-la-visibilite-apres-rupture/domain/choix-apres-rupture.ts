import type { AuteurId, MediateurId } from '@/features/mediateurs/domain'
import type { ReponseApresRupture } from './reponse-apres-rupture'
import type { RuptureEnAttente } from './rupture-en-attente'

export type ChoixApresRupture = {
  readonly mediateurId: MediateurId
  readonly choixPrecedentLe: Date | null
  readonly reponse: ReponseApresRupture
  readonly visible: boolean
  readonly rupture: RuptureEnAttente
  readonly auteurId: AuteurId
  readonly choisiLe: Date
}
