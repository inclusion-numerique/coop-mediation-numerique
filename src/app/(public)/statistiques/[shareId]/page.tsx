import { notFound } from 'next/navigation'
import { rechercherLesEmployeusesDuPartageAction } from '@/app/_actions/statistiques/rechercher-les-employeuses-du-partage.action'
import { rechercherLesLieuxDuPartageAction } from '@/app/_actions/statistiques/rechercher-les-lieux-du-partage.action'
import { filtreDeLieu } from '@/composition/statistiques/barre'
import { mesStatistiques } from '@/composition/statistiques/mes-statistiques'
import { utilisateurDuPartage } from '@/composition/statistiques/partage'
import {
  impressionDesStatistiques,
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@/composition/statistiques/sections'
import {
  nombreDAccompagnements,
  toutesLesStatistiques,
} from '@/features/activites/implementation/statistiques'
import { resoudreUnLienDePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage'
import {
  type ParametresDeLaPage,
  parametresDesStatistiquesPartagees,
} from '@/features/statistiques/ui/filtres/parametres-de-la-page'
import { RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY } from '@/features/statistiques/ui/filtres/plus-de-filtres/rechercher-employeuses-des-statistiques.key'
import { RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY } from '@/features/statistiques/ui/filtres/rechercher-les-lieux-des-statistiques.key'
import { StatistiquesPartagees } from '@/features/statistiques/ui/pages/StatistiquesPartagees'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

type PageProps = {
  params: Promise<{
    shareId: string
  }>
  searchParams: Promise<ParametresDeLaPage>
}

const Page = async ({ params, searchParams }: PageProps) => {
  const shareId = (await params).shareId
  const parametres = await searchParams

  const partage = await resoudreUnLienDePartage(shareId)
  if (!partage.success) return notFound()

  const user = await utilisateurDuPartage(partage.data)

  const { statistiques, ...mesStatistiquesProps } = await mesStatistiques({
    user,
    ...parametresDesStatistiquesPartagees(parametres),
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
