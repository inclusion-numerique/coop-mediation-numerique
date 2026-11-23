import { type Gestionnaire, peutGererLEquipe } from './gestionnaire'
import type { CoordinateurId } from './identifiants/coordinateur-id'

export type Lecteur = {
  readonly gestionnaire: Gestionnaire
  readonly membreActifDeLEquipe: boolean
}

export const peutConsulterLEquipe =
  ({ gestionnaire, membreActifDeLEquipe }: Lecteur) =>
  (coordinateurId: CoordinateurId): boolean =>
    membreActifDeLEquipe || peutGererLEquipe(gestionnaire)(coordinateurId)
