import { prismaClient } from '@app/web/prismaClient'
import { type CraConseillerNumeriqueV1 } from '@prisma/client'
import { type TransformCraV1Context, transformCraV1 } from './transformCraV1'

export const migrateCraV1 = async (
  cra: CraConseillerNumeriqueV1,
  {
    v1ConseillersIdsMap,
    v1PermanencesIdsMap,
    v1StructuresIdsMap,
  }: TransformCraV1Context,
) => {
  const transformedCra = transformCraV1(cra, {
    v1ConseillersIdsMap,
    v1PermanencesIdsMap,
    v1StructuresIdsMap,
  })
  try {
    await prismaClient.$transaction(async (tx) => {
      const existingActivite = await tx.activite.findUnique({
        where: {
          v1CraId: transformedCra.activite.v1CraId,
        },
        select: {
          id: true,
          accompagnements: {
            select: {
              id: true,
              beneficiaireId: true,
            },
          },
        },
      })
      if (existingActivite) {
        // Reset data
        await tx.accompagnement.deleteMany({
          where: {
            activiteId: existingActivite.id,
          },
        })
        await tx.beneficiaire.deleteMany({
          where: {
            id: {
              in: existingActivite.accompagnements.map(
                (accompagnement) => accompagnement.beneficiaireId,
              ),
            },
          },
        })
        await tx.activite.delete({
          where: {
            id: existingActivite.id,
          },
        })
      }

      await tx.activite.create({
        data: transformedCra.activite,
      })
      await tx.beneficiaire.createMany({
        data: transformedCra.beneficiaires,
      })
      await tx.accompagnement.createMany({
        data: transformedCra.accompagnements,
      })
    })
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: we need output from job executions
    console.error('Error migrating CRA V1', transformedCra)
    throw error
  }
}

export const migrateCrasV1 = async (
  cras: CraConseillerNumeriqueV1[],
  context: TransformCraV1Context,
) => {
  for (const cra of cras) {
    await migrateCraV1(cra, context)
  }
}
