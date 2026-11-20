import { deleteAll, seed } from '@/cli/fixtures/seeds'
import { prismaClient } from '@/configuration/prisma/prismaClient'

export const resetFixtures = async (
  _emptyParametersNeededForTypesafety: Record<string, string>,
) => {
  await deleteAll(prismaClient)
  await seed(prismaClient)

  return {
    done: true,
  }
}
