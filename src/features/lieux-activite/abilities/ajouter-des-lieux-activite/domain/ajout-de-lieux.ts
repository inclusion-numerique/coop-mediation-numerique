import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { LieuCarto } from './lieu-carto'
import type { LieuDemande } from './lieu-demande'

export type AjoutDeLieux = {
  readonly utilisateurId: UtilisateurId
  readonly mediateurId: MediateurId
  readonly lieux: readonly LieuDemande[]
  readonly structuresCarto: ReadonlyMap<string, LieuCarto>
  readonly ajouteLe: Date
}

export type LieuxAjoutes = AjoutDeLieux & {
  readonly lieuxRattaches: readonly LieuId[]
}
