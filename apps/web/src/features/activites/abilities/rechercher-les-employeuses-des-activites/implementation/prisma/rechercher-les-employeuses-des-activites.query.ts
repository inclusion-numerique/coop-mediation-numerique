import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import {
  colonnesDeLEmployeuse,
  employeuseDesActivitesDe,
  employeusesDesActivites,
} from '../../../../db/employeuses-des-activites.sql'
import type {
  EmployeuseDesActivites,
  EmployeuseId,
  PerimetreDesActivites,
} from '../../../../domain'

const recherchees = (
  recherche: string,
): Prisma.StructureAdministrativeMainWhereInput =>
  recherche === ''
    ? {}
    : {
        OR: [
          { denominationAntenne: { contains: recherche, mode: 'insensitive' } },
          { denominationSirene: { contains: recherche, mode: 'insensitive' } },
          {
            adresse: {
              nomCommune: { contains: recherche, mode: 'insensitive' },
            },
          },
        ],
      }

export const rechercherLesEmployeusesDesActivites = async ({
  perimetre,
  recherche,
  exclues,
}: {
  readonly perimetre: PerimetreDesActivites
  readonly recherche: string
  readonly exclues: readonly EmployeuseId[]
}): Promise<readonly EmployeuseDesActivites[]> => {
  if (perimetre.mediateurs.length === 0) return []

  const ids = await prismaClient.$queryRaw<{ id: number }[]>(
    employeusesDesActivites(perimetre),
  )

  const lignes = await prismaClient.structureAdministrativeMain.findMany({
    where: {
      AND: [
        { id: { in: ids.map(({ id }) => id) } },
        { id: { notIn: [...exclues] } },
        recherchees(recherche.toLowerCase().trim()),
      ],
    },
    select: colonnesDeLEmployeuse,
    orderBy: { denominationAntenne: 'asc' },
    take: 20,
  })

  return lignes.flatMap(employeuseDesActivitesDe)
}
