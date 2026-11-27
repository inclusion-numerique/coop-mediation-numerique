import { prismaClient } from '@/configuration/prisma'
import {
  colonnesDeLEmployeuse,
  employeuseDesActivitesDe,
  employeusesDesActivites,
} from '../../../../implementations/prisma/statistiques/employeuses-des-activites.sql'
import type { EmployeusesNommees } from '../../domain'

export const employeusesNommees: EmployeusesNommees = async ({
  perimetre,
  ids,
}) => {
  const duPerimetre = (
    await prismaClient.$queryRaw<{ id: number }[]>(
      employeusesDesActivites(perimetre),
    )
  ).map(({ id }) => id)

  const lignes = await prismaClient.structureAdministrativeMain.findMany({
    where: { AND: [{ id: { in: [...ids] } }, { id: { in: duPerimetre } }] },
    select: colonnesDeLEmployeuse,
    orderBy: { denominationAntenne: 'asc' },
  })

  return lignes.flatMap(employeuseDesActivitesDe)
}
