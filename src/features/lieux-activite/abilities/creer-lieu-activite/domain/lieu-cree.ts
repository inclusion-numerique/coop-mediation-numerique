import type { DestinationDuLieu } from '../../../domain/destination-du-lieu'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { Lieu } from '../../../domain/lieu'
import type { EcritureAuRegistre } from '../../../domain/registre/ecriture-au-registre'
import type { RattachementDuMediateur } from './ports'

export type LieuCree = {
  readonly destination: DestinationDuLieu<Lieu>
  readonly mediateurId: MediateurId
  readonly debut: Date
  readonly par: UtilisateurId | null
  readonly ecritureAuRegistre: EcritureAuRegistre
}

export type LieuActiviteCree = LieuCree & {
  readonly rattachement: RattachementDuMediateur
}
