import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import {
  employeuseSelect,
  employeuseToDomain,
} from '../../../../db/employeuse.transfer'
import type { RechercherEmployeuse } from '../../domain/rechercher-employeuse'

const LIMITE_PAR_DEFAUT = 50

const conditionsDeRecherche = (
  recherche: string,
): Prisma.StructureAdministrativeMainWhereInput => ({
  deletedAt: null,
  AND: recherche
    .split(' ')
    .filter((terme) => terme !== '')
    .map((terme) => ({
      OR: [
        { siret: { contains: terme, mode: 'insensitive' } },
        { denominationSirene: { contains: terme, mode: 'insensitive' } },
        { denominationAntenne: { contains: terme, mode: 'insensitive' } },
        { adresse: { nomVoie: { contains: terme, mode: 'insensitive' } } },
        { adresse: { nomCommune: { contains: terme, mode: 'insensitive' } } },
      ],
    })),
})

export const rechercherEmployeuse: RechercherEmployeuse = async ({
  recherche,
  limite = LIMITE_PAR_DEFAUT,
}) => {
  const where = conditionsDeRecherche(recherche)

  const [lignes, total] = await Promise.all([
    prismaClient.structureAdministrativeMain.findMany({
      where,
      take: limite,
      select: employeuseSelect,
      orderBy: { denominationAntenne: 'asc' },
    }),
    prismaClient.structureAdministrativeMain.count({ where }),
  ])

  return { employeuses: lignes.map(employeuseToDomain), total }
}
