import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import {
  employeuseSelect,
  employeuseToDomain,
} from '../../../../db/employeuse.transfer'
import type { ListerEmployeuses } from '../../domain/lister-employeuses'

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

// Colonnes triables, et ce qu'elles trient réellement en base. Ces clés sont
// celles que le tableau propose au tri (`ui/employeuses.data-table`) : les deux
// listes se répondent. Une colonne inconnue retombe sur l'ordre par défaut.
const trisDisponibles: Record<
  string,
  (
    sens: 'asc' | 'desc',
  ) => Prisma.StructureAdministrativeMainOrderByWithRelationInput
> = {
  nom: (sens) => ({ denominationAntenne: sens }),
  emplois: (sens) => ({ affectationsEmploi: { _count: sens } }),
  creation: (sens) => ({ createdAt: sens }),
  modification: (sens) => ({ updatedAt: sens }),
}

const ordreDeTri = (
  triPar: string | null,
  sens: 'asc' | 'desc' | null,
): Prisma.StructureAdministrativeMainOrderByWithRelationInput[] => {
  const tri = triPar ? trisDisponibles[triPar] : undefined
  if (!tri) return [{ denominationAntenne: 'asc' }]

  return [tri(sens ?? 'asc'), { denominationAntenne: 'asc' }]
}

export const listerEmployeuses: ListerEmployeuses = async ({
  recherche,
  page,
  parPage,
  triPar,
  sens,
}) => {
  const where = conditionsDeRecherche(recherche)

  const [lignes, total] = await Promise.all([
    prismaClient.structureAdministrativeMain.findMany({
      where,
      take: parPage,
      skip: (page - 1) * parPage,
      select: {
        ...employeuseSelect,
        _count: {
          select: { affectationsEmploi: { where: { estActive: true } } },
        },
      },
      orderBy: ordreDeTri(triPar, sens),
    }),
    prismaClient.structureAdministrativeMain.count({ where }),
  ])

  return {
    employeuses: lignes.map((ligne) => ({
      employeuse: employeuseToDomain(ligne),
      personnesEmployees: ligne._count.affectationsEmploi,
    })),
    total,
    pages: Math.max(Math.ceil(total / parPage), 1),
  }
}
