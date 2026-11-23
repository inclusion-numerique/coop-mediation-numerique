import { failure, type Result, success } from '@/libraries/result'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { type EchecDAjout, MediateurRequis, PanierVide } from './errors'
import type { LieuDemande } from './lieu-demande'

export const demandeDAjout = ({
  mediateurId,
  demandes,
}: {
  readonly mediateurId: MediateurId | null
  readonly demandes: readonly LieuDemande[]
}): Result<
  {
    readonly mediateurId: MediateurId
    readonly demandes: readonly LieuDemande[]
  },
  EchecDAjout
> =>
  mediateurId == null
    ? failure(MediateurRequis)
    : demandes.length === 0
      ? failure(PanierVide)
      : success({ mediateurId, demandes })
