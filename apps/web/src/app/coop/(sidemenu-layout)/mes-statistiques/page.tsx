import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { mediateurCoordonnesIdsFor } from '@app/web/mediateurs/mediateurCoordonnesIdsFor'
import { getStructureEmployeuseAddress } from '@app/web/structure/getStructureEmployeuseAddress'
import type { Metadata } from 'next'
import { MesStatistiques } from './MesStatistiques'
import { getMesStatistiquesPageData } from './getMesStatistiquesPageData'

export const metadata: Metadata = {
  title: metadataTitle('Mes statistiques'),
}
const MesStatistiquesPage = async (props: {
  searchParams: Promise<
    ActivitesFilters & {
      graphique_fin?: string
    }
  >
}) => {
  const searchParams = await props.searchParams
  const user = await authenticateMediateurOrCoordinateur()

  const mediateurCoordonnesIds = mediateurCoordonnesIdsFor(user)

  const mesStatistiques = await getMesStatistiquesPageData({
    user,
    activitesFilters: validateActivitesFilters(searchParams),
    graphOptions: {
      fin: searchParams.graphique_fin
        ? new Date(searchParams.graphique_fin)
        : undefined,
    },
  })

  const employeStructure = await getStructureEmployeuseAddress(user.id)

  return (
    <MesStatistiques
      user={user}
      mediateurCoordonnesCount={mediateurCoordonnesIds.length}
      {...mesStatistiques}
      codeInsee={employeStructure?.structure.codeInsee}
    />
  )
}

export default MesStatistiquesPage
