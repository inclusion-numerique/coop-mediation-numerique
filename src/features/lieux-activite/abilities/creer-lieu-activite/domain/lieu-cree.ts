import type { DestinationDuLieu } from '../../../domain/destination-du-lieu'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { Lieu } from '../../../domain/lieu'

export type LieuCree = {
  readonly destination: DestinationDuLieu<Lieu>
  readonly mediateurId: MediateurId
  readonly debut: Date
  readonly par: UtilisateurId | null
}
