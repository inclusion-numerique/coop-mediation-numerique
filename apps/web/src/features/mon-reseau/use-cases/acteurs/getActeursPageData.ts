import { departementsByCode } from '@app/web/data/collectivites-territoriales/departements'
import { isEmptySearchParams } from '@app/web/libs/data-table/isEmptySearchParams'
import { searchActeurs } from './db/searchActeurs'
import type { ActeursSearchParams } from './validation/ActeursFilters'

export type GetActeursPageDataOptions = {
  departementCode: string
  searchParams: ActeursSearchParams
}

export const getActeursPageData = async ({
  departementCode,
  searchParams,
}: GetActeursPageDataOptions) => {
  const departement = departementsByCode.get(departementCode)

  if (!departement) {
    throw new Error(`Département inconnu : ${departementCode}`)
  }

  const searchResult = await searchActeurs({
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

export type ActeursPageData = Awaited<ReturnType<typeof getActeursPageData>>
