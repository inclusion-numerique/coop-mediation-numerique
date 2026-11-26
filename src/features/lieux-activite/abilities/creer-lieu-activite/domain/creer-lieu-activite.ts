import { failure, type Result, success } from '@/libraries/result'
import { MediateurRequis } from '../../../domain/errors'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { Lieu } from '../../../domain/lieu'
import type { EchecDeCreerLieuActivite } from './errors'
import type { LieuCree } from './lieu-cree'
import type { CreerLieuActivitePorts } from './ports'

export const creerLieuActivite =
  ({ enregistrer }: CreerLieuActivitePorts) =>
  async ({
    lieu,
    mediateurId,
  }: {
    readonly lieu: Lieu
    readonly mediateurId: MediateurId | null
  }): Promise<Result<LieuCree, EchecDeCreerLieuActivite>> => {
    if (mediateurId == null) return failure(MediateurRequis())

    const id = await enregistrer({ lieu, mediateurId })

    return success({ id, lieu, mediateurId })
  }
