import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import type { AuteurId } from '../../domain/auteur-id'
import { MediateurIntrouvable } from '../../domain/errors'
import type { MediateurId } from '../../domain/mediateur-id'

export const reglerLaVisibiliteCarto = async ({
  mediateurId,
  visible,
  auteurId,
  maintenant = new Date(),
}: {
  readonly mediateurId: MediateurId
  readonly visible: boolean
  readonly auteurId: AuteurId
  readonly maintenant?: Date
}): Promise<Result<void, MediateurIntrouvable>> => {
  const stopwatch = createStopwatch()

  const mediateur = await prismaClient.mediateur.findFirst({
    where: { id: mediateurId, user: { deleted: null } },
    select: { id: true },
  })

  if (mediateur == null) return failure(MediateurIntrouvable(mediateurId))

  await prismaClient.mediateur.update({
    where: { id: mediateur.id },
    data: {
      isVisible: visible,
      modification: maintenant,
      user: { update: { updated: maintenant } },
    },
  })

  addMutationLog({
    userId: auteurId,
    nom: 'SetMediateurVisibility',
    duration: stopwatch.stop().duration,
    data: { mediateurId, isVisible: visible },
  })

  return success(undefined)
}
