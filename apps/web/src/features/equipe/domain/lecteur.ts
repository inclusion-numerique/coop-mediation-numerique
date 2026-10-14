import type { CoordinateurId } from './coordinateur-id'
import { type Gestionnaire, peutGererLEquipe } from './gestionnaire'

export type Lecteur = {
  readonly gestionnaire: Gestionnaire
  readonly membreActifDeLEquipe: boolean
}

export const peutConsulterLEquipe =
  ({ gestionnaire, membreActifDeLEquipe }: Lecteur) =>
  (coordinateurId: CoordinateurId): boolean =>
    membreActifDeLEquipe || peutGererLEquipe(gestionnaire)(coordinateurId)
