import { StatistiquesActivites } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_sections/StatistiquesActivites'
import { StatistiquesBeneficiaires } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_sections/StatistiquesBeneficiaires'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { SessionUser } from '@app/web/auth/sessionUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { FilterTags } from '@app/web/features/activites/use-cases/list/components/FilterTags'
import Filters from '@app/web/features/activites/use-cases/list/components/Filters'
import { contentId } from '@app/web/utils/skipLinks'
import { ExportStatistiques } from './_components/ExportStatistiques'
import { PrintStatistiques } from './_components/PrintStatistiques'
import { StatistiquesTerritoriales } from './_components/StatistiquesTerritoriales'
import { StatistiquesGenerales } from './_sections/StatistiquesGenerales'
import { MesStatistiquesPageData } from './getMesStatistiquesPageData'

export const MesStatistiques = (
  mesStatistiquesProps: MesStatistiquesPageData & {
    user: SessionUser
    codeInsee?: string | null
    mediateurCoordonnesCount: number
  },
) => {
  const {
    activitesFilters,
    communesOptions,
    departementsOptions,
    initialMediateursOptions,
    initialBeneficiairesOptions,
    lieuxActiviteOptions,
    activiteDates,
    user,
  } = mesStatistiquesProps

  return (
    <CoopPageContainer size={49}>
      <CoopBreadcrumbs currentPage="Mes statistiques" />
      <SkipLinksPortal />
      <PrintStatistiques {...mesStatistiquesProps} />
      <main className="fr-no-print" id={contentId}>
        <h1 className="fr-text-title--blue-france fr-mb-6v">
          Mes statistiques
        </h1>
        <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-mb-3w">
          <Filters
            defaultFilters={activitesFilters}
            communesOptions={communesOptions}
            departementsOptions={departementsOptions}
            lieuxActiviteOptions={lieuxActiviteOptions}
            initialMediateursOptions={initialMediateursOptions}
            initialBeneficiairesOptions={initialBeneficiairesOptions}
            beneficiairesFilter={false}
            minDate={activiteDates.first}
            isCoordinateur={user.coordinateur?.id != null}
            isMediateur={user.mediateur?.id != null}
          />
          <ExportStatistiques
            filters={activitesFilters}
            communesOptions={communesOptions}
            departementsOptions={departementsOptions}
            lieuxActiviteOptions={lieuxActiviteOptions}
            mediateursOptions={initialMediateursOptions}
            beneficiairesOptions={[]}
          />
        </div>
        <FilterTags
          filters={activitesFilters}
          communesOptions={communesOptions}
          departementsOptions={departementsOptions}
          lieuxActiviteOptions={lieuxActiviteOptions}
          mediateursOptions={initialMediateursOptions}
          beneficiairesOptions={[]}
        />
        <section className="fr-mb-6w fr-mt-6v">
          <StatistiquesGenerales {...mesStatistiquesProps} />
        </section>
        <section className="fr-mb-6w">
          <StatistiquesActivites {...mesStatistiquesProps} />
        </section>
        <section className="fr-mb-6w">
          <StatistiquesBeneficiaires {...mesStatistiquesProps} />
        </section>
      </main>
    </CoopPageContainer>
  )
}
