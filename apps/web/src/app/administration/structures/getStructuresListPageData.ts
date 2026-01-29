import { StructuresDataTableSearchParams } from '@app/web/features/structures/use-cases/list/StructuresDataTable'
import { searchStructures } from '@app/web/features/structures/use-cases/search/searchStructures'
import { prismaClient } from '@app/web/prismaClient'

export const getStructuresListPageData = async ({
  searchParams,
}: {
  searchParams: StructuresDataTableSearchParams
}) => {
  const [searchResult, totalCount] = await Promise.all([
    searchStructures({ searchParams }),
    prismaClient.structure.count({ where: { suppression: null } }),
  ])

  return {
    totalCount,
    searchResult,
    searchParams,
  }
}
