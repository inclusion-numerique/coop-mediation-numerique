import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { SynchroniserLaPersonne } from '@/features/mediateurs/implementations/prisma/synchroniser-la-personne.mutation'
import type { EnregistrerLeChoix } from '../../domain/choisir-la-visibilite-apres-rupture'

export const enregistrerLeChoix =
  (synchroniserLaPersonne: SynchroniserLaPersonne): EnregistrerLeChoix =>
  async ({ mediateur, reponse, visible, rupture, auteurId, maintenant }) => {
    const { count } = await prismaClient.$transaction(async (transaction) => {
      const ecriture = await transaction.mediateur.updateMany({
        where: {
          id: mediateur.id,
          visibiliteChoisieLe: mediateur.visibiliteChoisieLe,
        },
        data: { isVisible: visible, visibiliteChoisieLe: maintenant },
      })

      if (ecriture.count > 0) {
        await transaction.user.updateMany({
          where: { mediateur: { id: mediateur.id } },
          data: { updated: maintenant },
        })

        const { userId } = await transaction.mediateur.findUniqueOrThrow({
          where: { id: mediateur.id },
          select: { userId: true },
        })
        await synchroniserLaPersonne(transaction, userId, maintenant)
      }

      return ecriture
    })

    if (count === 0) return { enregistre: false }

    addMutationLog({
      userId: auteurId,
      nom: 'SetMediateurVisibility',
      data: {
        mediateurId: mediateur.id,
        reponse,
        dateRupture: rupture.dateRupture.toISOString(),
        isVisible: visible,
      },
    })

    return { enregistre: true }
  }
