import { CoordinateurId } from '../../../../domain'
import type { Inviteur } from '../../domain/inviter-des-membres'

export const inviteurDe = (user: {
  readonly coordinateur: { readonly id: string } | null
}): Inviteur =>
  user.coordinateur == null
    ? { type: 'NonCoordinateur' }
    : {
        type: 'Coordinateur',
        coordinateurId: CoordinateurId(user.coordinateur.id),
      }
