import { LieuxDataTableSearchParams } from '@app/web/features/structures/use-cases/list/LieuxDataTable'
import { searchLieux } from '@app/web/features/structures/use-cases/search/searchLieux'
import { prismaClient } from '@app/web/prismaClient'

export const getStructuresListPageData = async ({
  searchParams,
}: {
  searchParams: LieuxDataTableSearchParams
}) => {
  const [searchResult, totalCount] = await Promise.all([
    searchLieux({ searchParams }),
    prismaClient.lieuInclusion.count({ where: { suppression: null } }),
  ])

  return {
    totalCount,
    searchResult,
    searchParams,
  }
}
