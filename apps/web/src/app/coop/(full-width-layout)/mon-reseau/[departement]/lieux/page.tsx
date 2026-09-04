import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import {
  communesDesLieux,
  lieuxDuDepartement,
} from '@app/web/features/lieux-activite/abilities/lister-les-lieux-du-departement'
import { getDepartementFromCodeOrThrowNotFound } from '@app/web/features/mon-reseau/getDepartementFromCodeOrThrowNotFound'
import LieuxPage from '@app/web/features/mon-reseau/use-cases/lieux/LieuxPage'
import {
  type LieuxSearchParams,
  validateLieuxFilters,
} from '@app/web/features/mon-reseau/use-cases/lieux/validation/LieuxFilters'
import { isEmptySearchParams } from '@app/web/libs/data-table/isEmptySearchParams'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle("Annuaire des lieux d'activités"),
}

const Page = async ({
  params,
  searchParams: rawSearchParams,
}: {
  params: Promise<{ departement: string }>
  searchParams: Promise<LieuxSearchParams>
}) => {
  await authenticateMediateurOrCoordinateur()

  const { departement: departementCode } = await params
  const departement = getDepartementFromCodeOrThrowNotFound(departementCode)

  const unvalidatedSearchParams = await rawSearchParams
  const searchParams = validateLieuxFilters(unvalidatedSearchParams)

  // La recherche est celle des lieux, l'affichage celui de l'annuaire : les deux
  // features se rencontrent ici et nulle part ailleurs.
  const [searchResult, { communesOptions }] = await Promise.all([
    lieuxDuDepartement({ departementCode, searchParams }),
    communesDesLieux({ departementCode }),
  ])

  return (
    <LieuxPage
      departement={departement}
      searchResult={searchResult}
      searchParams={searchParams}
      isFiltered={!isEmptySearchParams(searchParams)}
      communesOptions={communesOptions}
    />
  )
}

export default Page
