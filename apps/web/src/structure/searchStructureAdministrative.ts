import {
  employeuseMainSelect,
  employeuseMainToLieuData,
} from '@app/web/features/structures/main/employeuseLieuData'
import { prismaClient } from '@app/web/prismaClient'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { Prisma } from '@prisma/client'

type SearchStructureAdministrativeOptions = {
  limit: number
}

// ADR-002 échange final : recherche d'identités légales employeuses sur `main.structure_administrative`
// (source de vérité), plus la copie coop. L'`id` renvoyé est l'entier main stringifié.
export const searchStructureAdministrative = async (
  query: string,
  options?: SearchStructureAdministrativeOptions,
) => {
  const structuresSearchLimit = options?.limit || 50
  const queryParts = query.split(' ')

  const matchesWhere = {
    deletedAt: null,
    AND: queryParts.map((part) => ({
      OR: [
        { siret: { contains: part, mode: 'insensitive' } },
        { denominationSirene: { contains: part, mode: 'insensitive' } },
        { denominationAntenne: { contains: part, mode: 'insensitive' } },
        { adresse: { nomVoie: { contains: part, mode: 'insensitive' } } },
        { adresse: { nomCommune: { contains: part, mode: 'insensitive' } } },
      ],
    })),
  } satisfies Prisma.StructureAdministrativeMainWhereInput

  const structuresRaw = await prismaClient.structureAdministrativeMain.findMany(
    {
      where: matchesWhere,
      take: structuresSearchLimit,
      select: employeuseMainSelect,
      orderBy: {
        denominationAntenne: 'asc',
      },
    },
  )

  const matchesCount = await prismaClient.structureAdministrativeMain.count({
    where: matchesWhere,
  })

  const structures = structuresRaw.map((structure) => {
    const lieuData = employeuseMainToLieuData(structure)
    return {
      id: String(structure.id),
      nom: toTitleCase(lieuData.nom, { noUpper: true }),
      commune: toTitleCase(lieuData.commune),
      adresse: toTitleCase(lieuData.adresse, { noUpper: true }),
      codePostal: lieuData.codePostal,
      codeInsee: lieuData.codeInsee,
      siret: lieuData.siret,
      rna: lieuData.rna,
    }
  })

  return {
    structures,
    matchesCount,
    moreResults: Math.max(matchesCount - structuresSearchLimit, 0),
  }
}
