import { addMutationLog } from '@/configuration/prisma/addMutationLog'
import { prismaClient } from '@/configuration/prisma/prismaClient'
import { synchroniserPersonne } from '@/libraries/registre-personne'

export const compteQuiActive = (utilisateurId: string) =>
  prismaClient.user.findUnique({
    where: { id: utilisateurId },
    select: {
      id: true,
      mediateur: { select: { id: true } },
      coordinateur: { select: { id: true } },
    },
  })

export const activer = async ({
  utilisateurId,
  coordinateurId,
  duree,
}: {
  readonly utilisateurId: string
  readonly coordinateurId: string
  readonly duree: () => number
}): Promise<string> => {
  const mediateur = await prismaClient.$transaction(async (transaction) => {
    const active = await transaction.mediateur.upsert({
      where: { userId: utilisateurId },
      create: { userId: utilisateurId },
      update: {},
      select: { id: true },
    })
    await synchroniserPersonne(transaction, utilisateurId)
    return active
  })

  addMutationLog({
    userId: utilisateurId,
    nom: 'CreerMediateur',
    duration: duree(),
    data: { coordinateurId },
  })

  return mediateur.id
}
