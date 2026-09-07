import { failure, type Result, success } from '@app/web/libraries/result'
import type { MediateurId } from '../../../domain/mediateur-id'
import { type EchecDAjout, MediateurRequis, PanierVide } from './errors'
import type { LieuDemande } from './lieu-demande'

/**
 * Ce qu'il faut réunir pour qu'un ajout ait un sens : quelqu'un à rattacher, et
 * quelque chose à lui rattacher.
 *
 * Ces deux refus sont des règles métier, pas des précautions de persistance :
 * ils se tiennent donc ici, et l'écriture n'a plus qu'à les honorer.
 */
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
