import {
  type AuteurId,
  type MediateurId,
  MediateurIntrouvable,
} from '@/features/mediateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDeReglerLaVisibiliteCarto } from './errors'
import type { ReglerLaVisibiliteCartoPorts } from './ports'
import type { ReglageDeVisibilite } from './reglage-de-visibilite'

export const reglerLaVisibiliteCarto =
  ({ lireLeMediateur, enregistrer }: ReglerLaVisibiliteCartoPorts) =>
  async ({
    mediateurId,
    visible,
    auteurId,
    maintenant,
  }: {
    readonly mediateurId: MediateurId
    readonly visible: boolean
    readonly auteurId: AuteurId
    readonly maintenant: Date
  }): Promise<Result<ReglageDeVisibilite, EchecDeReglerLaVisibiliteCarto>> => {
    const mediateur = await lireLeMediateur(mediateurId)

    if (mediateur === null) return failure(MediateurIntrouvable(mediateurId))

    const reglage: ReglageDeVisibilite = {
      mediateur,
      visible,
      auteurId,
      regleLe: maintenant,
    }

    await enregistrer(reglage)

    return success(reglage)
  }
