import type {
  AuteurId,
  MediateurId,
  UtilisateurId,
} from '@/features/mediateurs/domain'

export type MediateurARegler = {
  readonly id: MediateurId
  readonly utilisateurId: UtilisateurId
}

export type ReglageDeVisibilite = {
  readonly mediateur: MediateurARegler
  readonly visible: boolean
  readonly auteurId: AuteurId
  readonly regleLe: Date
}
