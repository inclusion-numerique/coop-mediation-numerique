import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import ActivitesListeLayout from '@app/web/features/activites/use-cases/list/components/ActivitesListeLayout'
import { getCoordinationsListPageData } from '@app/web/features/activites/use-cases/list/db/getCoordinationsListPageData'
import MesCoordinationsListePage from '@app/web/features/activites/use-cases/list/MesCoordinationsListePage'
import { validateCoordinationsFilters } from '@app/web/features/activites/use-cases/list/validation/CoordinationsFilters'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Mes activités de coordination'),
}

const MesCoordinationsPage = async ({
  searchParams: rawSearchParams,
}: {
  searchParams: Promise<{ lignes?: string; page?: string }>
}) => {
  const user = await authenticateCoordinateur()

  const searchParams = validateCoordinationsFilters(await rawSearchParams)

  const data = getCoordinationsListPageData({
    user,
    searchParams,
  })

  return (
    <ActivitesListeLayout
      vue="liste"
      href="/coop/mes-coordinations"
      empty
      subtitle={
        isCoordinateur(user) && isMediateur(user) ? 'Coordination' : undefined
      }
    >
      <MesCoordinationsListePage data={data} />
    </ActivitesListeLayout>
  )
}

export default MesCoordinationsPage
