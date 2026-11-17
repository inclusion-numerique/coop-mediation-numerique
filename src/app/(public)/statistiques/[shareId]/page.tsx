import { rechercherLesEmployeusesDuPartageAction } from '@app/web/app/_actions/statistiques/rechercher-les-employeuses-du-partage.action'
import { rechercherLesLieuxDuPartageAction } from '@app/web/app/_actions/statistiques/rechercher-les-lieux-du-partage.action'
import { filtreDeLieu } from '@app/web/composition/statistiques/barre'
import { mesStatistiques } from '@app/web/composition/statistiques/mes-statistiques'
import { utilisateurDuPartage } from '@app/web/composition/statistiques/partage'
import {
  impressionDesStatistiques,
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@app/web/composition/statistiques/sections'
import {
  nombreDAccompagnements,
  toutesLesStatistiques,
} from '@app/web/composition/statistiques/statistiques-fournies'
import { resoudreUnLienDePartage } from '@app/web/features/mediateurs/abilities/resoudre-un-lien-de-partage'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/features/statistiques/ui/filtres/parametres-de-la-barre'
import { RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY } from '@app/web/features/statistiques/ui/filtres/plus-de-filtres/rechercher-employeuses-des-statistiques.key'
import { RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY } from '@app/web/features/statistiques/ui/filtres/rechercher-les-lieux-des-statistiques.key'
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

  const user = await utilisateurDuPartage(partage.data)

  const { statistiques, ...mesStatistiquesProps } = await mesStatistiques({
    user,
    activitesFilters: validateActivitesFilters(search),
    graphOptions: {
      fin: search.graphique_fin ? new Date(search.graphique_fin) : undefined,
    },
  })
  const toutes = toutesLesStatistiques(statistiques)
  const { hasCrasV1 } = await statistiques.hasCrasV1

  return (
    <ClientBinder
      bind={RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY}
      to={rechercherLesEmployeusesDuPartageAction.bind(null, shareId)}
    >
      <ClientBinder
        bind={RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY}
        to={rechercherLesLieuxDuPartageAction.bind(null, shareId)}
      >
        <StatistiquesPartagees
          {...mesStatistiquesProps}
          username={user.name ?? ''}
          shareId={shareId}
          hasCrasV1={hasCrasV1}
          accompagnementsCount={nombreDAccompagnements(toutes)}
          filtreDeLieu={filtreDeLieu(mesStatistiquesProps)}
          impression={impressionDesStatistiques({
            ...mesStatistiquesProps,
            statistiques: toutes,
          })}
          generale={sectionGenerale(statistiques, { wording: 'generique' })}
          activites={sectionActivites(statistiques, { wording: 'generique' })}
          beneficiaires={sectionBeneficiaires(statistiques, {
            wording: 'generique',
          })}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
