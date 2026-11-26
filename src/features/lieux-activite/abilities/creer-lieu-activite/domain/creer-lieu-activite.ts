import { failure, type Result, success } from '@/libraries/result'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { Lieu } from '../../../domain/lieu'
import { type EchecDeCreation, MediateurRequis } from './errors'

export type EnregistrerLieuActivite = (entree: {
  readonly lieu: Lieu
  readonly mediateurId: MediateurId
}) => Promise<LieuId>

export const creerLieuActivite =
  ({ enregistrer }: { readonly enregistrer: EnregistrerLieuActivite }) =>
  async ({
    lieu,
    mediateurId,
  }: {
    readonly lieu: Lieu
    readonly mediateurId: MediateurId | null
  }): Promise<Result<{ readonly id: LieuId }, EchecDeCreation>> =>
    mediateurId == null
      ? failure(MediateurRequis)
      : success({ id: await enregistrer({ lieu, mediateurId }) })
