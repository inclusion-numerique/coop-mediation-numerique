import { deleteAll, seed } from '@/fixtures/seeds'
import { prismaClient } from '@/prismaClient'

export const resetFixtures = async (
  _emptyParametersNeededForTypesafety: Record<string, string>,
) => {
  await deleteAll(prismaClient)
  await seed(prismaClient)

  return {
    done: true,
  }
}
