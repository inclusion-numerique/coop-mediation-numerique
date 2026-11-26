import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { SynchroniserLaPersonne } from '@/features/mediateurs/implementations/prisma/synchroniser-la-personne.mutation'
import type { EnregistrerLeChoix } from '../../domain/ports'

export const enregistrerLeChoix =
  (synchroniserLaPersonne: SynchroniserLaPersonne): EnregistrerLeChoix =>
  async ({
    mediateurId,
    choixPrecedentLe,
    reponse,
    visible,
    rupture,
    auteurId,
    choisiLe,
  }) => {
    const { count } = await prismaClient.$transaction(async (transaction) => {
      const ecriture = await transaction.mediateur.updateMany({
        where: { id: mediateurId, visibiliteChoisieLe: choixPrecedentLe },
        data: { isVisible: visible, visibiliteChoisieLe: choisiLe },
      })

      if (ecriture.count > 0) {
        await transaction.user.updateMany({
          where: { mediateur: { id: mediateurId } },
          data: { updated: choisiLe },
        })

        const { userId } = await transaction.mediateur.findUniqueOrThrow({
          where: { id: mediateurId },
          select: { userId: true },
        })
        await synchroniserLaPersonne(transaction, userId, choisiLe)
      }

      return ecriture
    })

    if (count === 0) return { enregistre: false }

    addMutationLog({
      userId: auteurId,
      nom: 'SetMediateurVisibility',
      data: {
        mediateurId,
        reponse,
        dateRupture: rupture.dateRupture.toISOString(),
        isVisible: visible,
      },
    })

    return { enregistre: true }
  }
