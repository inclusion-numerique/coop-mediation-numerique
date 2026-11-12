import { LieuId } from '../../../../domain/lieu-id'
import { MediateurId } from '../../../../domain/mediateur-id'
import { verifierUnLieuDActivite } from './verifier-un-lieu-d-activite.query'

export const lieuUtilisablePar =
  (mediateurId: string | null) =>
  async (lieu: string, lieuActuel: string | null): Promise<boolean> => {
    const mediateur =
      mediateurId === null ? null : MediateurId.safe(mediateurId)
    const lieuId = LieuId.safe(lieu)
    if (mediateur === null || lieuId === null) return false
    return verifierUnLieuDActivite({
      lieuId,
      mediateurId: mediateur,
      lieuActuel: lieuActuel === null ? null : LieuId.safe(lieuActuel),
    })
  }
