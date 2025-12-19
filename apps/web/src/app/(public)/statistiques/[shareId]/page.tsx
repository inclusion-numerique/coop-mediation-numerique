import { getMesStatistiquesPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/getMesStatistiquesPageData'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { mediateurFromShareId } from '@app/web/features/mediateurs/use-cases/partage-statistiques/db/mediateurFromShareId'
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

  const mediateur = await mediateurFromShareId(shareId)
  if (!mediateur) return notFound()

  const mesStatistiquesProps = await getMesStatistiquesPageData({
    user: {
      ...mediateur.user,
      rdvAccount: null,
      mediateur: mediateur,
    },
    activitesFilters: validateActivitesFilters(search),
    graphOptions: {
      fin: search.graphique_fin ? new Date(search.graphique_fin) : undefined,
    },
  })

  return (
    <StatistiquesPage
      {...mesStatistiquesProps}
      username={mediateur.user.name ?? ''}
      shareId={shareId}
    />
  )
}

export default Page
