import { StatistiquesActivites } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_sections/StatistiquesActivites'
import { StatistiquesBeneficiaires } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_sections/StatistiquesBeneficiaires'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { SessionUser } from '@app/web/auth/sessionUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { FilterTags } from '@app/web/features/activites/use-cases/list/components/FilterTags'
import Filters from '@app/web/features/activites/use-cases/list/components/Filters'
import { contentId } from '@app/web/utils/skipLinks'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Link from 'next/link'
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
    tagsOptions,
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
            tagsOptions={tagsOptions}
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
            tagsOptions={tagsOptions}
            accompagnementsCount={
              mesStatistiquesProps.totalCounts.accompagnements.total
            }
          />
        </div>
        <FilterTags
          filters={activitesFilters}
          communesOptions={communesOptions}
          departementsOptions={departementsOptions}
          lieuxActiviteOptions={lieuxActiviteOptions}
          mediateursOptions={initialMediateursOptions}
          beneficiairesOptions={[]}
          tagsOptions={tagsOptions}
        />
        {(user.coordinateur || user.mediateur?.conseillerNumerique) && (
          <Notice
            className="fr-notice--flex fr-align-items-center fr-mt-6v"
            title={
              <span className="fr-text--xs fr-text--regular fr-text-default--grey">
                Les activités renseignées dans l’Espace Coop (V1) sont
                maintenant visibles sur cette page statistique.{' '}
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://www.notion.so/incubateurdesterritoires/Consolidation-des-statistiques-des-exports-Ao-t-2025-242744bf03dd80c18869d38bb6d983f2"
                  className="fr-link fr-text--xs"
                >
                  En savoir plus
                </Link>
              </span>
            }
          />
        )}
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
