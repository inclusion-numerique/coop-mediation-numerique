import { rechercherEmployeusesDesActivitesAction } from '@app/web/app/_actions/activites/rechercher-employeuses-des-activites.action'
import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { getSessionUserFromId } from '@app/web/auth/getSessionUserFromSessionToken'
import { getMesStatistiquesPageData } from '@app/web/composition/statistiques/mes-statistiques'
import {
  impressionDesStatistiques,
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@app/web/composition/statistiques/sections'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { resoudreUnLienDePartage } from '@app/web/features/mediateurs/abilities/resoudre-un-lien-de-partage'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/features/statistiques/domain/filtres-des-statistiques'
import { RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY } from '@app/web/features/statistiques/ui/filtres/plus-de-filtres/rechercher-employeuses-des-statistiques.key'
import { StatistiquesPartagees } from '@app/web/features/statistiques/ui/pages/StatistiquesPartagees'
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

  const partage = await resoudreUnLienDePartage(shareId)
  if (!partage.success) return notFound()

  const { proprietaire, utilisateurId } = partage.data
  const user = await getSessionUserFromId(utilisateurId)

  const mesStatistiquesProps = await getMesStatistiquesPageData({
    user: {
      ...user,
      emplois: [],
      rdvAccount: null,
      mediateur: user.mediateur,
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
      bind={RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY}
      to={rechercherEmployeusesDesActivitesAction}
    >
      <ClientBinder
        bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
        to={rechercherUnLieuActiviteAction}
      >
        <StatistiquesPartagees
          {...mesStatistiquesProps}
          username={user.name ?? ''}
          shareId={shareId}
          hasCrasV1={mesStatistiquesProps.hasCrasV1.hasCrasV1}
          accompagnementsCount={
            mesStatistiquesProps.totalCounts.accompagnements.total
          }
          impression={impressionDesStatistiques(mesStatistiquesProps)}
          generale={sectionGenerale(mesStatistiquesProps, {
            wording: 'generique',
          })}
          activites={sectionActivites(mesStatistiquesProps, {
            wording: 'generique',
          })}
          beneficiaires={sectionBeneficiaires(mesStatistiquesProps, {
            wording: 'generique',
          })}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
