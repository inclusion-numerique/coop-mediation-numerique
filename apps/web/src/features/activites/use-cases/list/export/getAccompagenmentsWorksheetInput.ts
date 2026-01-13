import type { ExportDebugLogger } from '@app/web/app/coop/(sidemenu-layout)/mes-activites/export/route'
import type { SessionUser } from '@app/web/auth/sessionUser'
import { getFiltersOptionsForMediateur } from '@app/web/components/filters/getFiltersOptionsForMediateur'
import { mediateurCoordonnesIdsFor } from '@app/web/mediateurs/mediateurCoordonnesIdsFor'
import { generateActivitesFiltersLabels } from '../components/generateActivitesFiltersLabels'
import { addTimezoneToActivite } from '../db/addTimezoneToActivite'
import {
  type SearchActiviteResultRow,
  searchActivite,
} from '../db/searchActivite'
import type { ActivitesFilters } from '../validation/ActivitesFilters'
import type { BuildActivitesWorksheetInput } from './buildAccompagnementsWorksheet'

const EXPORT_BATCH_SIZE = 500

const fetchActivitesInBatches = async (
  {
    mediateurIds,
    beneficiaireIds,
    filters,
  }: {
    mediateurIds: string[]
    beneficiaireIds?: string[]
    filters: ActivitesFilters
  },
  log: ExportDebugLogger,
): Promise<SearchActiviteResultRow[]> => {
  const allActivites: SearchActiviteResultRow[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    log(`Fetching activites batch ${page}`)

    const { activites, totalPages } = await searchActivite({
      mediateurIds,
      beneficiaireIds,
      searchParams: {
        ...filters,
        lignes: String(EXPORT_BATCH_SIZE),
        page: String(page),
      },
    })

    allActivites.push(...activites)

    log(`Batch ${page}/${totalPages} complete`, {
      batchCount: activites.length,
      totalSoFar: allActivites.length,
    })

    hasMore = page < totalPages
    page++
  }

  return allActivites
}

export const getAccompagenmentsWorksheetInput = async ({
  user,
  filters,
  mediateurIds,
  hasCraV1,
  log,
}: {
  user: SessionUser
  filters: ActivitesFilters
  mediateurIds: string[]
  hasCraV1: boolean
  log: ExportDebugLogger
}): Promise<BuildActivitesWorksheetInput> => {
  const mediateurCoordonnesIds = mediateurCoordonnesIdsFor(user)

  const activites = await fetchActivitesInBatches(
    {
      mediateurIds,
      beneficiaireIds: filters.beneficiaires,
      filters,
    },
    log,
  )

  log('All activites fetched', { totalCount: activites.length })

  const {
    communesOptions,
    departementsOptions,
    initialBeneficiairesOptions,
    initialMediateursOptions,
    lieuxActiviteOptions,
    tagsOptions,
    activiteSourceOptions,
  } = await getFiltersOptionsForMediateur({
    user,
    mediateurCoordonnesIds,
    includeBeneficiaireIds: filters.beneficiaires,
  })

  log('getFiltersOptionsForMediateur complete')

  const activitesFiltersLabels = generateActivitesFiltersLabels(filters, {
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
    beneficiairesOptions: initialBeneficiairesOptions,
    mediateursOptions: initialMediateursOptions,
    tagsOptions,
    activiteSourceOptions,
  })

  return {
    activites: activites.map(addTimezoneToActivite(user)),
    user,
    mediateur: user,
    filters: activitesFiltersLabels,
    hasCraV1,
  }
}
