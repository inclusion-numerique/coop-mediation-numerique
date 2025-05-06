import { getCommunesAndDepartementsOptions } from '@app/web/features/lieux-activite/getCommunesAndDepartementsOptions'
import { getLieuxActiviteOptions } from '@app/web/features/lieux-activite/getLieuxActiviteOptions'
import { UtilisateursDataTableSearchParams } from '@app/web/features/utilisateurs/use-cases/list/UtilisateursDataTable'
import { searchUtilisateur } from '@app/web/features/utilisateurs/use-cases/search/searchUtilisateur'
import { prismaClient } from '@app/web/prismaClient'

export const getUtilisateursListPageData = async ({
  searchParams,
}: {
  searchParams: UtilisateursDataTableSearchParams
}) => {
  const searchResult = await searchUtilisateur({
    searchParams,
  })

  const { communesOptions, departementsOptions } =
    await getCommunesAndDepartementsOptions()

  const lieuxActiviteOptions = await getLieuxActiviteOptions()

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
