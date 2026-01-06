import { getMesStatistiquesPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/getMesStatistiquesPageData'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { userFromShareId } from '@app/web/features/mediateurs/use-cases/partage-statistiques/db/userFromShareId'
import { StatistiquesPage } from '@app/web/features/mediateurs/use-cases/partage-statistiques/page/statistiques'
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
  const user =
    shareStatsUser?.mediateur?.user ?? shareStatsUser?.coordinateur?.user

  if (
    user == null ||
    (shareStatsUser?.mediateur == null && shareStatsUser?.coordinateur == null)
  )
    return notFound()

  const mesStatistiquesProps = await getMesStatistiquesPageData({
    user: {
      ...user,
      rdvAccount: null,
      mediateur: shareStatsUser?.mediateur,
      coordinateur: shareStatsUser?.coordinateur,
    },
    activitesFilters: validateActivitesFilters(search),
    graphOptions: {
      fin: search.graphique_fin ? new Date(search.graphique_fin) : undefined,
    },
  })

  return (
    <StatistiquesPage
      {...mesStatistiquesProps}
      username={user.name ?? ''}
      shareId={shareId}
    />
  )
}

export default Page
