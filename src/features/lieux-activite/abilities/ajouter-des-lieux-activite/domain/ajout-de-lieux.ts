import type { DestinationDuLieu } from '../../../domain/destination-du-lieu'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { CreationDemandee } from './destination-du-lieu'

export type AjoutDeLieux = {
  readonly utilisateurId: UtilisateurId
  readonly mediateurId: MediateurId
  readonly destinations: readonly DestinationDuLieu<CreationDemandee>[]
  readonly ajouteLe: Date
}

export type LieuxAjoutes = AjoutDeLieux & {
  readonly lieuxRattaches: readonly LieuId[]
}
