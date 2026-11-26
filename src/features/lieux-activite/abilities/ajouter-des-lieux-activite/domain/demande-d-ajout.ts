import { failure, type Result, success } from '@/libraries/result'
import { MediateurRequis } from '../../../domain/errors'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { type EchecDeAjouterDesLieuxActivite, PanierVide } from './errors'
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
  EchecDeAjouterDesLieuxActivite
> => {
  if (mediateurId == null) return failure(MediateurRequis())
  if (demandes.length === 0) return failure(PanierVide())
  return success({ mediateurId, demandes })
}
