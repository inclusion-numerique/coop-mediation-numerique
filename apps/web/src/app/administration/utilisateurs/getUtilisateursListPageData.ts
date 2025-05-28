import { getCommunesAndDepartementsOptions } from '@app/web/features/lieux-activite/getCommunesAndDepartementsOptions'
import { getLieuxActiviteOptions } from '@app/web/features/lieux-activite/getLieuxActiviteOptions'
import { UtilisateursDataTableSearchParams } from '@app/web/features/utilisateurs/use-cases/list/UtilisateursDataTable'
import { searchUtilisateur } from '@app/web/features/utilisateurs/use-cases/search/searchUtilisateur'
import { prismaClient } from '@app/web/prismaClient'
import { debugPromiseTiming } from '@app/web/utils/debugPromiseTiming'

export const getUtilisateursListPageData = async ({
  searchParams,
}: {
  searchParams: UtilisateursDataTableSearchParams
}) => {
  const [
    searchResult,
    { communesOptions, departementsOptions },
    lieuxActiviteOptions,
  ] = await Promise.all([
    debugPromiseTiming(
      searchUtilisateur({
        searchParams,
      }),
      { name: 'searchUtilisateur' },
    ),
    debugPromiseTiming(getCommunesAndDepartementsOptions(), {
      name: 'getCommunesAndDepartementsOptions',
    }),
    debugPromiseTiming(getLieuxActiviteOptions(), {
      name: 'getLieuxActiviteOptions',
    }),
  ])

  const totalCount = await prismaClient.user.count({})

  return {
    totalCount,
    searchResult,
    searchParams,
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
  }
}
