import {
  employeuseMainSelect,
  employeuseMainToLieuData,
} from '@app/web/features/structures/main/employeuseLieuData'
import { prismaClient } from '@app/web/prismaClient'

// Structure employeuse de l'inscription lue depuis `main` (source de vérité, ADR-002 étape 6).
// L'`id` exposé est l'entier `main.structure_administrative.id` : il sert de clé à la mutation
// `ajouterStructureEmployeuseEnLieuActivite`, qui matérialise le lieu depuis les données main.
export const getStructureEmployeuseForInscription = async ({
  userId,
}: {
  userId: string
}) => {
  const emploi = await prismaClient.employeStructure.findFirst({
    where: {
      userId,
      suppression: null,
      fin: null,
    },
    orderBy: {
      debut: 'desc',
    },
    select: {
      id: true,
      structureMain: {
        select: employeuseMainSelect,
      },
    },
  })

  if (!emploi?.structureMain) return null

  return {
    id: emploi.id,
    structure: {
      id: emploi.structureMain.id,
      ...employeuseMainToLieuData(emploi.structureMain),
    },
  }
}

export type StructureEmployeuseForInscription = NonNullable<
  Awaited<ReturnType<typeof getStructureEmployeuseForInscription>>
>

export type InscriptionStructureEmployeuse =
  StructureEmployeuseForInscription['structure']
