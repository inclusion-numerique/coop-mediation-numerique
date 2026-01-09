import { departementsByCode } from '@app/web/data/collectivites-territoriales/departements'
import { isEmptySearchParams } from '@app/web/libs/data-table/isEmptySearchParams'
import { searchLieux } from './db/searchLieux'
import type { LieuxSearchParams } from './validation/LieuxFilters'

export type GetLieuxPageDataOptions = {
  departementCode: string
  searchParams: LieuxSearchParams
}

export const getLieuxPageData = async ({
  departementCode,
  searchParams,
}: GetLieuxPageDataOptions) => {
  const departement = departementsByCode.get(departementCode)

  if (!departement) {
    throw new Error(`Département inconnu : ${departementCode}`)
  }

  const searchResult = await searchLieux({
    departementCode,
    searchParams,
  })

  const isFiltered = !isEmptySearchParams(searchParams)

  return {
    departement,
    searchResult,
    searchParams,
    isFiltered,
  }
}

export type LieuxPageData = Awaited<ReturnType<typeof getLieuxPageData>>
