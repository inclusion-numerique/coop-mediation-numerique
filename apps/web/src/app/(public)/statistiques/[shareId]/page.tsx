import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { getMesStatistiquesPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/getMesStatistiquesPageData'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { personneEstConseillerNumerique } from '@app/web/features/employeuse/server'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { userFromShareId } from '@app/web/features/mediateurs/use-cases/partage-statistiques/db/userFromShareId'
import { StatistiquesPage } from '@app/web/features/mediateurs/use-cases/partage-statistiques/page/statistiques'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{
    shareId: string
  }>
  searchParams: Promise<
    ActivitesFilters & {
      graphique_fin?: string
    }
  >
}

const Page = async ({ params, searchParams }: PageProps) => {
  const shareId = (await params).shareId
  const searchParamsResolved = await searchParams

  const search = {
    ...searchParamsResolved,
    au: searchParamsResolved.au ?? new Date().toISOString().slice(0, 10),
  }

  const shareStatsUser = await userFromShareId(shareId)
  const mediateurUser = shareStatsUser?.mediateur?.user
  const coordinateurUser = shareStatsUser?.coordinateur?.user
  const user = mediateurUser ?? coordinateurUser

  if (
    user == null ||
    (shareStatsUser?.mediateur == null && shareStatsUser?.coordinateur == null)
  )
    return notFound()

  const mesStatistiquesProps = await getMesStatistiquesPageData({
    user: {
      ...user,
      isConseillerNumerique: personneEstConseillerNumerique(user.personneMain),
      rdvAccount: null,
      mediateur: shareStatsUser?.mediateur ?? null,
      coordinateur: shareStatsUser?.coordinateur ?? null,
    },
    activitesFilters: validateActivitesFilters(search),
    graphOptions: {
      fin: search.graphique_fin ? new Date(search.graphique_fin) : undefined,
    },
  })

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <StatistiquesPage
        {...mesStatistiquesProps}
        username={user.name ?? ''}
        shareId={shareId}
      />
    </ClientBinder>
  )
}

export default Page
