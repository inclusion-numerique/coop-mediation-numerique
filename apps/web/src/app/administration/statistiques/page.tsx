import { getUtilisateursListPageData } from '@app/web/app/administration/utilisateurs/getUtilisateursListPageData'
import {
  getAccompagnementsCountByDay,
  getAccompagnementsCountByMonth,
} from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getAccompagnementsCountByPeriod'
import { getActivitesStats } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getActivitesStats'
import { getBeneficiaireStats } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getBeneficiaireStats'
import { getTotalCountsStats } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getTotalCountsStats'
import { StatistiquesActivites } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_sections/StatistiquesActivites'
import { StatistiquesBeneficiaires } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_sections/StatistiquesBeneficiaires'
import { StatistiquesGenerales } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_sections/StatistiquesGenerales'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import Filters from '@app/web/features/activites/use-cases/list/components/Filters'
import { FilterTags } from '@app/web/features/activites/use-cases/list/components/FilterTags'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { activiteSourceOptions } from '@app/web/features/activites/use-cases/source/activiteSource'
import { getTagsCollectifs } from '@app/web/features/activites/use-cases/tags/db/getTagsCollectifs'
import { getImpactStats } from '@app/web/server/impact/getImpactStats'

export const metadata = {
  title: metadataTitle('Usurpation'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<
    ActivitesFilters & {
      graphique_fin?: string
    }
  >
}) => {
  const searchParams = await props.searchParams
  const activitesFilters = validateActivitesFilters(searchParams)
  const user = await authenticateUser()
  const tagsOptions = await getTagsCollectifs()

  const { communesOptions, departementsOptions, lieuxActiviteOptions } =
    await getUtilisateursListPageData({
      searchParams,
    })

  const [
    accompagnementsParJour,
    accompagnementsParMois,
    beneficiaires,
    activites,
    totalCounts,
    _impactStats,
  ] = await Promise.all([
    getAccompagnementsCountByDay({ activitesFilters }),
    getAccompagnementsCountByMonth({ activitesFilters }),
    getBeneficiaireStats({ activitesFilters }),
    getActivitesStats({ activitesFilters, user }),
    getTotalCountsStats({ activitesFilters }),
    getImpactStats({ activitesFilters }),
  ])

  return (
    <>
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-mb-3w">
        <Filters
          defaultFilters={activitesFilters}
          communesOptions={communesOptions}
          departementsOptions={departementsOptions}
          lieuxActiviteOptions={lieuxActiviteOptions}
          tagsOptions={tagsOptions}
          initialMediateursOptions={[]}
          initialBeneficiairesOptions={[]}
          minDate={new Date('2024-09-01')}
          beneficiairesFilter={false}
          isCoordinateur={false}
          isMediateur={false}
          hasCrasV1={true}
        />
      </div>
      <FilterTags
        filters={activitesFilters}
        communesOptions={communesOptions}
        departementsOptions={departementsOptions}
        lieuxActiviteOptions={lieuxActiviteOptions}
        tagsOptions={[]}
        mediateursOptions={[]}
        beneficiairesOptions={[]}
        activiteSourceOptions={activiteSourceOptions}
      />
      <section className="fr-mb-6w">
        <StatistiquesGenerales
          wording="generique"
          totalCounts={totalCounts}
          accompagnementsParJour={accompagnementsParJour}
          accompagnementsParMois={accompagnementsParMois}
        />
      </section>
      <section className="fr-mb-6w">
        <StatistiquesActivites
          isAdmin
          wording="generique"
          totalCounts={totalCounts}
          activites={activites}
        />
      </section>
      <section className="fr-mb-6w">
        <StatistiquesBeneficiaires
          beneficiaires={beneficiaires}
          wording="generique"
        />
      </section>
    </>
  )
}

export default Page
