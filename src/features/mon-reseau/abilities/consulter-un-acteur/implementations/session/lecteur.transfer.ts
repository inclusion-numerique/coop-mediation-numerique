import { ActeurId, CoordinateurId } from '../../../../domain'
import type { Lecteur } from '../../domain'

export type UtilisateurDeLaSession = {
  readonly id: string
  readonly coordinateur: { readonly id: string } | null
}

export const lecteurDeLaSession = ({
  id,
  coordinateur,
}: UtilisateurDeLaSession): Lecteur =>
  coordinateur === null
    ? { _tag: 'Mediateur', acteurId: ActeurId(id) }
    : {
        _tag: 'Coordinateur',
        acteurId: ActeurId(id),
        coordinateurId: CoordinateurId(coordinateur.id),
      }
