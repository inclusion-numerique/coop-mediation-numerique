import { prismaClient } from '@/configuration/prisma/prismaClient'
import { EmployeuseId, type LireEmployeuseActuelle } from '../domain'

export const lireEmployeuseActuelle: LireEmployeuseActuelle = async (
  userId,
) => {
  const employeuseActuelle = await prismaClient.employeuseActuelle.findFirst({
    where: { personne: { coopId: userId } },
    select: { structureAdministrativeId: true },
  })

  return employeuseActuelle === null
    ? null
    : EmployeuseId(employeuseActuelle.structureAdministrativeId)
}
