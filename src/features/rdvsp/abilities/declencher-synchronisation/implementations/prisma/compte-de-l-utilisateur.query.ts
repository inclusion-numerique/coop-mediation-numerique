import { prismaClient } from '@/configuration/prisma'

export const compteDeLUtilisateur = async (
  utilisateurId: string,
): Promise<{ compteId: number; mediateurId?: string } | null> => {
  const { mediateur, rdvAccount } = await prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurId },
    select: {
      mediateur: { select: { id: true } },
      rdvAccount: { select: { id: true } },
    },
  })

  return rdvAccount === null
    ? null
    : {
        compteId: rdvAccount.id,
        ...(mediateur === null ? {} : { mediateurId: mediateur.id }),
      }
}
