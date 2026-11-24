import { prismaClient } from '@/configuration/prisma/prismaClient'
import type {
  EmployeuseDesActivites,
  EmployeuseId,
  PerimetreDesActivites,
} from '../../../../domain'
import {
  colonnesDeLEmployeuse,
  employeuseDesActivitesDe,
  employeusesDesActivites,
} from '../../../../implementations/prisma/statistiques/employeuses-des-activites.sql'

export const employeusesNommees = async ({
  perimetre,
  ids,
}: {
  readonly perimetre: PerimetreDesActivites
  readonly ids: readonly EmployeuseId[]
}): Promise<readonly EmployeuseDesActivites[]> => {
  if (ids.length === 0 || perimetre.mediateurs.length === 0) return []

  const duPerimetre = (
    await prismaClient.$queryRaw<{ id: number }[]>(
      employeusesDesActivites(perimetre),
    )
  ).map(({ id }) => id)

  const lignes = await prismaClient.structureAdministrativeMain.findMany({
    where: { id: { in: ids.filter((id) => duPerimetre.includes(id)) } },
    select: colonnesDeLEmployeuse,
    orderBy: { denominationAntenne: 'asc' },
  })

  return lignes.flatMap(employeuseDesActivitesDe)
}
