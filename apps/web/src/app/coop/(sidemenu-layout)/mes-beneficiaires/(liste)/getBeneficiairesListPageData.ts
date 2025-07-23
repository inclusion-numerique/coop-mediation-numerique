import { BeneficiairesDataTableSearchParams } from '@app/web/beneficiaire/BeneficiairesDataTable'
import { searchBeneficiaires } from '@app/web/beneficiaire/searchBeneficiaires'
import { isEmptySearchParams } from '@app/web/libs/data-table/isEmptySearchParams'

export const getBeneficiairesListPageData = async ({
  mediateurId,
  searchParams,
}: {
  mediateurId: string
  searchParams: BeneficiairesDataTableSearchParams
}) => {
  const searchResult = await searchBeneficiaires({
    mediateurId,
    searchParams,
  })

  return {
    isFiltered: !isEmptySearchParams(searchParams),
    searchResult,
    searchParams,
    mediateurId,
  }
}

export type BeneficiairesListPageData = Exclude<
  Awaited<ReturnType<typeof getBeneficiairesListPageData>>,
  null
>
