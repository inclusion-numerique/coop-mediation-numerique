import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { SynchroniserLaPersonne } from '@/features/mediateurs/implementations/prisma/synchroniser-la-personne.mutation'
import type { EnregistrerLaVisibilite } from '../../domain/regler-la-visibilite-carto'

export const enregistrerLaVisibilite =
  (synchroniserLaPersonne: SynchroniserLaPersonne): EnregistrerLaVisibilite =>
  async ({ mediateur, visible, auteurId, maintenant }) => {
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
      await synchroniserLaPersonne(
        transaction,
        mediateur.utilisateurId,
        maintenant,
      )
    })

    addMutationLog({
      userId: auteurId,
      nom: 'SetMediateurVisibility',
      data: { mediateurId: mediateur.id, isVisible: visible },
    })
  }
