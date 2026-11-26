import type {
  AuteurId,
  MediateurId,
  UtilisateurId,
} from '@/features/mediateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { MediateurIntrouvable } from './errors'

export type MediateurARegler = {
  readonly id: MediateurId
  readonly utilisateurId: UtilisateurId
}

export type LireLeMediateurARegler = (
  mediateurId: MediateurId,
) => Promise<MediateurARegler | null>

export type EnregistrerLaVisibilite = (reglage: {
  readonly mediateur: MediateurARegler
  readonly visible: boolean
  readonly auteurId: AuteurId
  readonly maintenant: Date
}) => Promise<void>

export const reglerLaVisibiliteCarto =
  ({
    lireLeMediateur,
    enregistrer,
  }: {
    readonly lireLeMediateur: LireLeMediateurARegler
    readonly enregistrer: EnregistrerLaVisibilite
  }) =>
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
  }): Promise<Result<void, MediateurIntrouvable>> => {
    const mediateur = await lireLeMediateur(mediateurId)

    if (mediateur === null) return failure(MediateurIntrouvable(mediateurId))

    await enregistrer({ mediateur, visible, auteurId, maintenant })

    return success(undefined)
  }
