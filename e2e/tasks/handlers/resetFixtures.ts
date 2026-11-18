import { prismaClient } from '@/configuration/prisma/prismaClient'
import { deleteAll, seed } from '@/fixtures/seeds'

export const resetFixtures = async (
  _emptyParametersNeededForTypesafety: Record<string, string>,
) => {
  await deleteAll(prismaClient)
  await seed(prismaClient)

  return {
    done: true,
  }
}
