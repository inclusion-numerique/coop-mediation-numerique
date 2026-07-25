import {
  employeuseMainSelect,
  employeuseMainToLieuData,
} from '@app/web/features/structures/main/employeuseLieuData'
import { prismaClient } from '@app/web/prismaClient'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { Prisma } from '@prisma/client'

// ADR-002 échange final : la liste d'administration des EMPLOYEUSES lit désormais
// `main.structure_administrative` (source de vérité), pas la copie coop. L'`id` exposé est l'entier
// main stringifié (clé de route/CSV). Le compteur d'emplois vient des affectations actives main.

const EPOCH = new Date(0)

export const queryStructuresAdministrativesForList = async ({
  skip,
  take,
  where,
  orderBy,
}: {
  where: Prisma.StructureAdministrativeMainWhereInput
  take?: number
  skip?: number
  orderBy?: Prisma.StructureAdministrativeMainOrderByWithRelationInput[]
}) => {
  const structures = await prismaClient.structureAdministrativeMain.findMany({
    where,
    take,
    skip,
    select: {
      ...employeuseMainSelect,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { affectationsEmploi: { where: { estActive: true } } },
      },
    },
    orderBy: [...(orderBy ?? []), { denominationAntenne: 'asc' }],
  })

  return structures.map((structure) => {
    const lieuData = employeuseMainToLieuData(structure)
    return {
      id: String(structure.id),
      nom: toTitleCase(lieuData.nom, { noUpper: true }),
      siret: lieuData.siret,
      adresse: toTitleCase(lieuData.adresse, { noUpper: true }),
      commune: toTitleCase(lieuData.commune),
      codePostal: lieuData.codePostal,
      creation: structure.createdAt ?? EPOCH,
      modification: structure.updatedAt ?? structure.createdAt ?? EPOCH,
      _count: { emplois: structure._count.affectationsEmploi },
    }
  })
}

export type StructureAdministrativeForList = Awaited<
  ReturnType<typeof queryStructuresAdministrativesForList>
>[number]
