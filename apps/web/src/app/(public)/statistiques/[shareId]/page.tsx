import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { getMesStatistiquesPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/getMesStatistiquesPageData'
import { getSessionUserFromId } from '@app/web/auth/getSessionUserFromSessionToken'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { resoudreUnLienDePartage } from '@app/web/features/mediateurs/abilities/resoudre-un-lien-de-partage'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { notFound } from 'next/navigation'
import { StatistiquesPage } from './StatistiquesPage'

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

  const partage = await resoudreUnLienDePartage(shareId)
  if (!partage.success) return notFound()

  const { proprietaire, utilisateurId } = partage.data
  const user = await getSessionUserFromId(utilisateurId)

  const mesStatistiquesProps = await getMesStatistiquesPageData({
    user: {
      ...user,
      emplois: [],
      rdvAccount: null,
      mediateur: proprietaire._tag === 'Mediateur' ? user.mediateur : null,
      coordinateur:
        proprietaire._tag === 'Coordinateur' ? user.coordinateur : null,
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
