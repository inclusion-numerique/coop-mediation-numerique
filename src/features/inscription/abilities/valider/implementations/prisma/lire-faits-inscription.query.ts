import { prismaClient } from '@/configuration/prisma'
import type { LireFaitsInscription } from '../../domain/ports'

export const lireFaitsInscription: LireFaitsInscription = async (userId) => {
  const row = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      profilInscription: true,
      acceptationCgu: true,
      inscriptionValidee: true,
      mediateur: { select: { id: true } },
      coordinateur: { select: { id: true } },
    },
  })

  return {
    userId,
    profilChoisi: row?.profilInscription != null,
    compteDeRoleExiste: row?.mediateur != null || row?.coordinateur != null,
    dejaValidee: row?.inscriptionValidee != null,
    cguDejaAcceptee: row?.acceptationCgu != null,
  }
}
