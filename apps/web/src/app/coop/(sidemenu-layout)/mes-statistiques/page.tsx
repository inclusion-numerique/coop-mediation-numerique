import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { getActeurEmploiForDate } from '@app/web/features/mon-reseau/use-cases/acteurs/db/getActeurEmploiForDate'
import { mediateurCoordonnesIdsFor } from '@app/web/mediateurs/mediateurCoordonnesIdsFor'
import type { Metadata } from 'next'
import { getMesStatistiquesPageData } from './getMesStatistiquesPageData'
import { MesStatistiques } from './MesStatistiques'

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

  const employeStructure = await getActeurEmploiForDate({
    userId: user.id,
    date: new Date(),
    strictDateBounds: true,
  })

  return (
    <MesStatistiques
      user={user}
      mediateurCoordonnesCount={mediateurCoordonnesIds.length}
      codeInsee={employeStructure?.structure.codeInsee}
      {...mesStatistiques}
    />
  )
}

export default MesStatistiquesPage
