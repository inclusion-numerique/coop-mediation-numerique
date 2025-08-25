import { prismaClient } from '@app/web/prismaClient'
import { type CraConseillerNumeriqueV1 } from '@prisma/client'
import { type TransformCraV1Context, transformCraV1 } from './transformCraV1'

export const migrateCrasV1 = async (
  cras: CraConseillerNumeriqueV1[],
  {
    v1ConseillersIdsMap,
    v1PermanencesIdsMap,
    v1StructuresIdsMap,
  }: TransformCraV1Context,
) => {
  const transformedCras = cras.map((cra) =>
    transformCraV1(cra, {
      v1ConseillersIdsMap,
      v1PermanencesIdsMap,
      v1StructuresIdsMap,
    }),
  )

  for (const transformedCra of transformedCras) {
    const existingActivite = await prismaClient.activite.findUnique({
      where: {
        v1CraId: transformedCra.activite.v1CraId,
      },
    })
    if (existingActivite) {
      return
    }
    await prismaClient.activite.upsert({
      where: {
        v1CraId: transformedCra.activite.v1CraId,
      },
      create: transformedCra.activite,
      update: {
        ...transformedCra.activite,
      },
    })
    await prismaClient.beneficiaire.createMany({
      data: transformedCra.beneficiaires,
    })
    await prismaClient.accompagnement.createMany({
      data: transformedCra.accompagnements,
    })
  }
}
