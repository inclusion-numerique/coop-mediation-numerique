import { type StructuresAdministrativesDataTableSearchParams } from '@app/web/features/structures/use-cases/list-administrative/StructuresAdministrativesDataTable'
import { searchStructuresAdministratives } from '@app/web/features/structures/use-cases/list-administrative/searchStructuresAdministratives'
import { prismaClient } from '@app/web/prismaClient'

export const getStructuresAdministrativesListPageData = async ({
  searchParams,
}: {
  searchParams: StructuresAdministrativesDataTableSearchParams
}) => {
  const [searchResult, totalCount] = await Promise.all([
    searchStructuresAdministratives({ searchParams }),
    prismaClient.structureAdministrative.count({
      where: { suppression: null },
    }),
  ])

  return {
    totalCount,
    searchResult,
    searchParams,
  }
}
