import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type {
  CoordinateurId,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'

export const activer =
  (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  async ({
    utilisateurId,
    coordinateurId,
  }: {
    readonly utilisateurId: UtilisateurId
    readonly coordinateurId: CoordinateurId
  }): Promise<void> => {
    await prismaClient.$transaction(async (transaction) => {
      await transaction.mediateur.upsert({
        where: { userId: utilisateurId },
        create: { userId: utilisateurId },
        update: {},
        select: { id: true },
      })
      await synchroniserLaPersonne(transaction, utilisateurId)
    })

    addMutationLog({
      userId: utilisateurId,
      nom: 'CreerMediateur',
      data: { coordinateurId },
    })
  }
