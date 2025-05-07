import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import EquipeListePage from '@app/web/equipe/EquipeListePage/EquipeListePage'
import { getEquipePageData } from '@app/web/equipe/EquipeListePage/getEquipePageData'
import type { EquipeSearchParams } from '@app/web/equipe/EquipeListePage/searchMediateursCoordonneBy'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Mon équipe'),
}

const Page = async (props: { searchParams: Promise<EquipeSearchParams> }) => {
  const searchParams = await props.searchParams
  const authenticatedCoordinateur = await authenticateCoordinateur()

  const equipePageData = await getEquipePageData({
    searchParams,
    coordinateur: authenticatedCoordinateur.coordinateur,
  })

  return (
    <EquipeListePage
      {...equipePageData}
      searchParams={searchParams}
      baseHref="/coop/mon-equipe"
      baseHrefSearch="/coop/mon-equipe"
      coordinateur={{
        id: authenticatedCoordinateur.coordinateur.id,
        user: authenticatedCoordinateur,
      }}
    />
  )
}

export default Page
