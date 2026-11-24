import type { Sort } from '@arckit/resultset'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { Prisma } from '@/generated/prisma/client'
import {
  employeuseSelect,
  employeuseToDomain,
} from '../../../../implementations/prisma/employeuse.transfer'
import type {
  ColonneDesEmployeuses,
  ListerEmployeuses,
} from '../../domain/lister-employeuses'

/**
 * Mêmes conditions que l'autocomplétion — la règle de recherche est unique, seul
 * le mode de restitution change (pages et tri, plutôt qu'une poignée de choix).
 */
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
        { adresse: { codePostal: { contains: terme, mode: 'insensitive' } } },
      ],
    })),
})

const trisDisponibles: Record<
  ColonneDesEmployeuses,
  (
    sens: 'asc' | 'desc',
  ) => Prisma.StructureAdministrativeMainOrderByWithRelationInput
> = {
  nom: (sens) => ({ denominationAntenne: sens }),
  emplois: (sens) => ({ affectationsEmploi: { _count: sens } }),
  creation: (sens) => ({ createdAt: sens }),
  modification: (sens) => ({ updatedAt: sens }),
}

const ordreDeTri = ({
  field,
  direction,
}: Sort<ColonneDesEmployeuses>): Prisma.StructureAdministrativeMainOrderByWithRelationInput[] => [
  trisDisponibles[field](direction),
  { denominationAntenne: 'asc' },
]

export const listerEmployeuses: ListerEmployeuses = async ({
  recherche,
  tri,
  page,
  pageSize,
}) => {
  const where = conditionsDeRecherche(recherche)

  const [lignes, total] = await Promise.all([
    prismaClient.structureAdministrativeMain.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        ...employeuseSelect,
        _count: {
          select: { affectationsEmploi: { where: { estActive: true } } },
        },
      },
      orderBy: ordreDeTri(tri),
    }),
    prismaClient.structureAdministrativeMain.count({ where }),
  ])

  return {
    items: lignes.map((ligne) => ({
      employeuse: employeuseToDomain(ligne),
      personnesEmployees: ligne._count.affectationsEmploi,
    })),
    totalItems: total,
    currentPage: page,
    pageSize,
  }
}
