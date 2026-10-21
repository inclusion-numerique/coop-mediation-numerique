import { personneConseillerNumeriqueSelect } from '@app/web/features/employeuse/server'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'

export const compteQuiActive = (utilisateurId: string) =>
  prismaClient.user.findUnique({
    where: { id: utilisateurId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      inscriptionValidee: true,
      mediateur: { select: { id: true } },
      coordinateur: { select: { id: true } },
      personneMain: { select: personneConseillerNumeriqueSelect },
    },
  })

export type CompteLu = NonNullable<Awaited<ReturnType<typeof compteQuiActive>>>

export const activer = async ({
  utilisateurId,
  coordinateurId,
  duree,
}: {
  readonly utilisateurId: string
  readonly coordinateurId: string
  readonly duree: () => number
}): Promise<string> => {
  const mediateur = await prismaClient.mediateur.upsert({
    where: { userId: utilisateurId },
    create: { userId: utilisateurId },
    update: {},
    select: { id: true },
  })

  addMutationLog({
    userId: utilisateurId,
    nom: 'CreerMediateur',
    duration: duree(),
    data: { coordinateurId },
  })

  return mediateur.id
}
