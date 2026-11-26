import { v4 } from 'uuid'
import type { Prisma } from '@/generated/prisma/client'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'

export const rattacherSiAbsent = async (
  transaction: Prisma.TransactionClient,
  {
    utilisateurId,
    lieuId,
    debut,
    creationParId,
    journaliser,
  }: {
    readonly utilisateurId: string
    readonly lieuId: LieuId
    readonly debut: Date
    readonly creationParId: string | null
    readonly journaliser: () => void
  },
): Promise<void> => {
  const dejaRattache = await transaction.mediateurEnActivite.findFirst({
    where: {
      mediateur: { userId: utilisateurId },
      structureId: lieuId,
      suppression: null,
      fin: null,
    },
    select: { id: true },
  })

  if (dejaRattache) return

  journaliser()

  await transaction.mediateurEnActivite.create({
    data: {
      id: v4(),
      mediateur: { connect: { userId: utilisateurId } },
      lieuInclusion: { connect: { id: lieuId } },
      debut,
      ...(creationParId === null
        ? {}
        : { creationPar: { connect: { id: creationParId } } }),
    },
  })
}
