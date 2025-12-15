import { ExportStatistiques } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_components/ExportStatistiques'
import { PrintStatistiques } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_components/PrintStatistiques'
import { StatistiquesActivites } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_sections/StatistiquesActivites'
import { StatistiquesBeneficiaires } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_sections/StatistiquesBeneficiaires'
import { StatistiquesGenerales } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_sections/StatistiquesGenerales'
import { MesStatistiquesPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/getMesStatistiquesPageData'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import Filters from '@app/web/features/activites/use-cases/list/components/Filters'
import { FilterTags } from '@app/web/features/activites/use-cases/list/components/FilterTags'
import { contentId } from '@app/web/utils/skipLinks'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Link from 'next/link'

export const StatistiquesPage = (
  statistiquesProps: MesStatistiquesPageData & {
    shareId: string
    username: string
  },
) => {
  const {
    shareId,
    username,
    activitesFilters,
    communesOptions,
    departementsOptions,
    tagsOptions,
    initialMediateursOptions,
    initialBeneficiairesOptions,
    lieuxActiviteOptions,
    activiteSourceOptions,
    activiteDates,
    hasCrasV1,
    totalCounts,
  } = statistiquesProps

  return (
    <>
      <SkipLinksPortal />
      <PrintStatistiques {...statistiquesProps} />
      <main
        id={contentId}
        className="fr-container fr-no-print fr-container--800 fr-mt-12v fr-mb-32v"
      >
        <h1 className="fr-text-title--blue-france fr-h3 fr-mb-5v">
          Statistiques d’activités de médiation numérique de {username}
        </h1>
        <Notice
          className="fr-notice--flex fr-align-items-center fr-my-6v"
          title={
            <span className="fr-text--sm fr-text--regular fr-text-default--grey">
              Consultez sur cette page les statistiques de <b>{username}</b>{' '}
              pour mieux comprendre et suivre l’évolution de son activité. Vous
              pouvez utiliser les filtres ci-dessous afin d’affiner les
              statistiques et exporter.{' '}
              <Link
                target="_blank"
                rel="noreferrer"
                href=""
                className="fr-link fr-text--xs"
              >
                En savoir plus sur les statistiques
              </Link>
            </span>
          }
        />
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
            isCoordinateur={false}
            isMediateur={true}
            hasCrasV1={hasCrasV1.hasCrasV1}
          />
          <div className="fr-flex fr-flex-gap-2v">
            <ExportStatistiques
              filters={activitesFilters}
              communesOptions={communesOptions}
              departementsOptions={departementsOptions}
              lieuxActiviteOptions={lieuxActiviteOptions}
              mediateursOptions={initialMediateursOptions}
              beneficiairesOptions={[]}
              tagsOptions={tagsOptions}
              accompagnementsCount={totalCounts.accompagnements.total}
              activiteSourceOptions={activiteSourceOptions}
              exportListAccompagnements={false}
              publicExportId={shareId}
            />
          </div>
        </div>
        <FilterTags
          filters={activitesFilters}
          communesOptions={communesOptions}
          departementsOptions={departementsOptions}
          lieuxActiviteOptions={lieuxActiviteOptions}
          mediateursOptions={initialMediateursOptions}
          beneficiairesOptions={[]}
          tagsOptions={tagsOptions}
          activiteSourceOptions={activiteSourceOptions}
        />
        {hasCrasV1.hasCrasV1 && (
          <Notice
            className="fr-notice--flex fr-align-items-center fr-mt-6v"
            title={
              <span className="fr-text--xs fr-text--regular fr-text-default--grey">
                Les activités renseignées dans l’Espace Coop (V1) sont
                maintenant visibles sur cette page statistique.{' '}
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://docs.numerique.gouv.fr/docs/e2e794bb-30b3-41ea-a24f-4ef5c8ec074c"
                  className="fr-link fr-text--xs"
                >
                  En savoir plus
                </Link>
              </span>
            }
          />
        )}
        <section className="fr-mb-6w fr-mt-6v">
          <StatistiquesGenerales {...statistiquesProps} />
        </section>
        <section className="fr-mb-6w">
          <StatistiquesActivites {...statistiquesProps} />
        </section>
        <section className="fr-mb-6w">
          <StatistiquesBeneficiaires {...statistiquesProps} />
        </section>
      </main>
    </>
  )
}
