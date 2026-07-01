import { prismaClient } from '@app/web/prismaClient'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { Prisma } from '@prisma/client'

// Sélection pour la liste d'administration des EMPLOYEUSES (structure_administrative).
// Frère de `searchStructureSelect` (qui cible le rôle lieu, cf. split 1a.2).
// Le compteur d'emplois vient de la relation FK directe `emplois` (employes_structures.structure_id).
export const structureAdministrativeForListSelect = {
  id: true,
  nom: true,
  siret: true,
  adresse: true,
  commune: true,
  codePostal: true,
  denomination: true,
  creation: true,
  modification: true,
  _count: {
    select: {
      emplois: {
        where: { suppression: null },
      },
    },
  },
} satisfies Prisma.StructureAdministrativeSelect

export const queryStructuresAdministrativesForList = async ({
  skip,
  take,
  where,
  orderBy,
}: {
  where: Prisma.StructureAdministrativeWhereInput
  take?: number
  skip?: number
  orderBy?: Prisma.StructureAdministrativeOrderByWithRelationInput[]
}) => {
  const structures = await prismaClient.structureAdministrative.findMany({
    where,
    take,
    skip,
    select: structureAdministrativeForListSelect,
    orderBy: [...(orderBy ?? []), { nom: 'asc' }],
  })

  return structures.map(({ nom, adresse, commune, ...rest }) => ({
    ...rest,
    nom: toTitleCase(nom, { noUpper: true }),
    adresse: toTitleCase(adresse, { noUpper: true }),
    commune: toTitleCase(commune),
  }))
}

export type StructureAdministrativeForList = Awaited<
  ReturnType<typeof queryStructuresAdministrativesForList>
>[number]
