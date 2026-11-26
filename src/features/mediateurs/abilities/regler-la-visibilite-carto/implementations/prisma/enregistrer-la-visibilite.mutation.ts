import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { SynchroniserLaPersonne } from '@/features/mediateurs/implementations/prisma/synchroniser-la-personne.mutation'
import type { EnregistrerLaVisibilite } from '../../domain/ports'

export const enregistrerLaVisibilite =
  (synchroniserLaPersonne: SynchroniserLaPersonne): EnregistrerLaVisibilite =>
  async ({ mediateur, visible, auteurId, regleLe }) => {
    await prismaClient.$transaction(async (transaction) => {
      await transaction.mediateur.update({
        where: { id: mediateur.id },
        data: {
          isVisible: visible,
          visibiliteChoisieLe: regleLe,
          modification: regleLe,
          user: { update: { updated: regleLe } },
        },
      })
      await synchroniserLaPersonne(
        transaction,
        mediateur.utilisateurId,
        regleLe,
      )
    })

    addMutationLog({
      userId: auteurId,
      nom: 'SetMediateurVisibility',
      data: { mediateurId: mediateur.id, isVisible: visible },
    })
  }
