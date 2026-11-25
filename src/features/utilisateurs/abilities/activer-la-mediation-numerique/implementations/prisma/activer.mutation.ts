import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'

export const compteQuiActive = (utilisateurId: string) =>
  prismaClient.user.findUnique({
    where: { id: utilisateurId },
    select: {
      id: true,
      mediateur: { select: { id: true } },
      coordinateur: { select: { id: true } },
    },
  })

export const activer =
  (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  async ({
    utilisateurId,
    coordinateurId,
  }: {
    readonly utilisateurId: string
    readonly coordinateurId: string
  }): Promise<string> => {
    const mediateur = await prismaClient.$transaction(async (transaction) => {
      const active = await transaction.mediateur.upsert({
        where: { userId: utilisateurId },
        create: { userId: utilisateurId },
        update: {},
        select: { id: true },
      })
      await synchroniserLaPersonne(transaction, utilisateurId)
      return active
    })

    addMutationLog({
      userId: utilisateurId,
      nom: 'CreerMediateur',
      data: { coordinateurId },
    })

    return mediateur.id
  }
