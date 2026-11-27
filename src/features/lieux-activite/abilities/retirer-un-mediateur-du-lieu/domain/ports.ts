import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type {
  AvisDeRetrait,
  FinDuRattachement,
  RattachementEnCours,
} from './retrait-du-lieu'

export type TrouverLeRattachementEnCours = (rattachement: {
  readonly mediateurId: MediateurId
  readonly lieuId: LieuId
}) => Promise<RattachementEnCours | null>

export type TerminerLeRattachement = (fin: FinDuRattachement) => Promise<void>

type EnvoyerLeRetraitDuLieu = (retrait: AvisDeRetrait) => Promise<void>

export type RetirerUnMediateurDuLieuPorts = {
  readonly trouverLeRattachementEnCours: TrouverLeRattachementEnCours
  readonly envoyerLeRetraitDuLieu: EnvoyerLeRetraitDuLieu
  readonly terminerLeRattachement: TerminerLeRattachement
}
