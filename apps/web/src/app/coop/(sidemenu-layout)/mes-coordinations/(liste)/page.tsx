import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import ActivitesListeLayout from '@app/web/features/activites/use-cases/list/components/ActivitesListeLayout'
import { CoordinationFilterTags } from '@app/web/features/activites/use-cases/list/components/CoordinationFilterTags'
import { ActiviteCoordinationPeriodeFilter } from '@app/web/features/activites/use-cases/list/components/filters/ActiviteCoordinationPeriodeFilter'
import { ActiviteCoordinationTypeFilter } from '@app/web/features/activites/use-cases/list/components/filters/ActiviteCoordinationTypeFilter'
import { getCoordinationsDateRange } from '@app/web/features/activites/use-cases/list/db/getCoordinationsDateRange'
import { getCoordinationsListPageData } from '@app/web/features/activites/use-cases/list/db/getCoordinationsListPageData'
import MesCoordinationsListePage from '@app/web/features/activites/use-cases/list/MesCoordinationsListePage'
import { validateCoordinationsFilters } from '@app/web/features/activites/use-cases/list/validation/CoordinationsFilters'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Mes activités de coordination'),
}

const MesCoordinationsPage = async ({
  searchParams: rawSearchParams,
}: {
  searchParams: Promise<{ lignes?: string; page?: string; types?: string }>
}) => {
  const user = await authenticateCoordinateur()

  const searchParams = validateCoordinationsFilters(await rawSearchParams)

  const data = getCoordinationsListPageData({
    user,
    searchParams,
  })

  const dateRange = await getCoordinationsDateRange({ user })
  const now = new Date()

  return (
    <ActivitesListeLayout
      vue="liste"
      href="/coop/mes-coordinations"
      empty
      subtitle={
        isCoordinateur(user) && isMediateur(user) ? 'Coordination' : undefined
      }
    >
      <div className="fr-flex fr-align-items-center fr-flex-gap-2v fr-mb-6v">
        <ActiviteCoordinationPeriodeFilter
          minDate={new Date(dateRange._min.date ?? now)}
          maxDate={new Date(dateRange._max.date ?? now)}
        />
        <ActiviteCoordinationTypeFilter />
      </div>
      <CoordinationFilterTags
        ignoreParams={['page', 'lignes']}
        filters={[
          ...(searchParams.du != null && searchParams.au != null
            ? [
                {
                  params: ['du', 'au'],
                  label: `${dateAsIsoDay(searchParams.du)} - ${dateAsIsoDay(searchParams.au)}`,
                },
              ]
            : []),
          ...searchParams.types.map((type) => {
            return {
              params: ['types'],
              value: type,
              label: type,
            }
          }),
        ]}
      />
      <MesCoordinationsListePage data={data} />
    </ActivitesListeLayout>
  )
}

export default MesCoordinationsPage
