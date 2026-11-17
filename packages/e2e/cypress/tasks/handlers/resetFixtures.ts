import { deleteAll, seed } from '@app/web/fixtures/seeds'
import { prismaClient } from '@app/web/prismaClient'

export const resetFixtures = async (
  _emptyParametersNeededForTypesafety: Record<string, string>,
) => {
  await deleteAll(prismaClient)
  await seed(prismaClient)

  return {
    done: true,
  }
}
