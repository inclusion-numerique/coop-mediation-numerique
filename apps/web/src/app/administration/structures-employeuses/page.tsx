import { metadataTitle } from '@app/web/app/metadataTitle'
import EmployeusesListePage from '@app/web/features/employeuse/abilities/lister-employeuses/ui/pages/EmployeusesListePage'
import {
  type EmployeusesSearchParams,
  employeuseAffichee,
  listerEmployeuses,
} from '@app/web/features/employeuse/server'
import { DEFAULT_PAGE, toNumberOr } from '@app/web/libs/data-table/toNumberOr'

export const metadata = {
  title: metadataTitle('Structures employeuses'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const PAR_PAGE_PAR_DEFAUT = 100

const Page = async (props: {
  searchParams: Promise<EmployeusesSearchParams>
}) => {
  const searchParams = await props.searchParams

  const { employeuses, total, pages } = await listerEmployeuses({
    recherche: searchParams.recherche ?? '',
    page: toNumberOr(searchParams.page)(DEFAULT_PAGE),
    parPage: toNumberOr(searchParams.lignes)(PAR_PAGE_PAR_DEFAUT),
    triPar: searchParams.tri ?? null,
    sens: searchParams.ordre ?? null,
  })

  return (
    <EmployeusesListePage
      employeuses={employeuses.map(employeuseAffichee)}
      trouvees={total}
      pages={pages}
      searchParams={searchParams}
    />
  )
}

export default Page
