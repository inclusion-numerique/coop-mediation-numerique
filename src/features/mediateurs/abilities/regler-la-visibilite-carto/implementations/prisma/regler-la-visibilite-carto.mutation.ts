import { addMutationLog } from '@/configuration/prisma/add-mutation-log'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { AuteurId, MediateurId } from '@/features/mediateurs/domain'
import type { SynchroniserLaPersonne } from '@/features/mediateurs/implementations/prisma/synchroniser-la-personne.mutation'
import { createStopwatch } from '@/libraries/chronometre/stopwatch'
import { failure, type Result, success } from '@/libraries/result'
import { MediateurIntrouvable } from '../../domain/errors'

export const reglerLaVisibiliteCarto =
  (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  async ({
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
      select: { id: true, userId: true },
    })

    if (mediateur == null) return failure(MediateurIntrouvable(mediateurId))

    await prismaClient.$transaction(async (transaction) => {
      await transaction.mediateur.update({
        where: { id: mediateur.id },
        data: {
          isVisible: visible,
          visibiliteChoisieLe: maintenant,
          modification: maintenant,
          user: { update: { updated: maintenant } },
        },
      })
      await synchroniserLaPersonne(transaction, mediateur.userId, maintenant)
    })

    addMutationLog({
      userId: auteurId,
      nom: 'SetMediateurVisibility',
      duration: stopwatch.stop().duration,
      data: { mediateurId, isVisible: visible },
    })

    return success(undefined)
  }
