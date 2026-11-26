import { prismaClient } from '@/configuration/prisma'
import type { LireLEtatDeLInscription } from '../../domain/ports'
import { inscriptionEtatToDomain } from './inscription-etat.transfer'

export const getInscriptionEtat: LireLEtatDeLInscription = async (userId) => {
  const row = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      profilInscription: true,
      acceptationCgu: true,
      structureEmployeuseRenseignee: true,
      lieuxActiviteRenseignes: true,
      inscriptionValidee: true,
    },
  })

  return row === null ? null : inscriptionEtatToDomain(row)
}
