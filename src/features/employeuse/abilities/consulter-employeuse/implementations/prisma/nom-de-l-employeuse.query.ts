import { prismaClient } from '@/configuration/prisma'
import {
  employeuseSelect,
  employeuseToDomain,
} from '../../../../implementations/prisma/employeuse.transfer'
import type { NomDeLEmployeuse } from '../../domain/ports'

export const nomDeLEmployeuse: NomDeLEmployeuse = async (id) => {
  const ligne = await prismaClient.structureAdministrativeMain.findFirst({
    where: { id, deletedAt: null },
    select: employeuseSelect,
  })

  return ligne === null ? null : (employeuseToDomain(ligne).denomination ?? '')
}
