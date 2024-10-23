import type { Metadata } from 'next'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { getAuthenticatedMediateurOrCoordinateur } from '@app/web/auth/getAuthenticatedMediateur'
import { getStructureEmployeuseAddress } from '@app/web/structure/getStructureEmployeuseAddress'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/cra/ActivitesFilters'
import { SessionUser } from '@app/web/auth/sessionUser'
import { getMesStatistiquesPageData } from './getMesStatistiquesPageData'
import { MesStatistiques } from './MesStatistiques'

export const metadata: Metadata = {
  title: metadataTitle('Mes statistiques'),
}

const getMediateursIds = (user: SessionUser) => {
  const ids = []

  if (user.mediateur) ids.push(user.mediateur.id)
  if (user.coordinateur) {
    for (const { mediateurId } of user.coordinateur.mediateursCoordonnes) {
      ids.push(mediateurId)
    }
  }

  return ids
}

const MesStatistiquesPage = async ({
  searchParams = {},
}: {
  searchParams?: ActivitesFilters & {
    graphique_fin?: string
  }
}) => {
  const user = await getAuthenticatedMediateurOrCoordinateur()

  const mesStatistiques = await getMesStatistiquesPageData({
    mediateurIds: getMediateursIds(user),
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
      {...mesStatistiques}
      codeInsee={employeStructure?.structure.codeInsee}
    />
  )
}

export default MesStatistiquesPage
