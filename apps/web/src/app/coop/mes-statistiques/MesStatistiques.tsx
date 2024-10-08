import { contentId, defaultSkipLinks } from '@app/web/utils/skipLinks'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import ActivitesFilterTags from '@app/web/app/coop/mes-activites/(liste)/ActivitesFilterTags'
import { StatistiquesActivites } from '@app/web/app/coop/mes-statistiques/_sections/StatistiquesActivites'
import { StatistiquesBeneficiaires } from '@app/web/app/coop/mes-statistiques/_sections/StatistiquesBeneficiaires'
import CoopBreadcrumbs from '../CoopBreadcrumbs'
import CoopPageContainer from '../CoopPageContainer'
import { ExportStatistiques } from './_components/ExportStatistiques'
import { StatistiquesTerritoriales } from './_components/StatistiquesTerritoriales'
import { StatistiquesGenerales } from './_sections/StatistiquesGenerales'
import { MesStatistiquesPageData } from './getMesStatistiquesPageData'

export const MesStatistiques = (
  mesStatistiquesProps: MesStatistiquesPageData & {
    codeInsee?: string | null
  },
) => {
  const {
    activitesFilters,
    communesOptions,
    departementsOptions,
    initialBeneficiairesOptions,
    lieuxActiviteOptions,
  } = mesStatistiquesProps

  return (
    <CoopPageContainer size={794} className="fr-pt-8v">
      <CoopBreadcrumbs currentPage="Mes statistiques" />
      <SkipLinksPortal links={defaultSkipLinks} />
      <main id={contentId}>
        <h1 className="fr-text-title--blue-france fr-mb-2w">
          Mes statistiques
        </h1>
        <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-mb-3w">
          <ActivitesFilterTags
            defaultFilters={activitesFilters}
            communesOptions={communesOptions}
            departementsOptions={departementsOptions}
            lieuxActiviteOptions={lieuxActiviteOptions}
            initialBeneficiairesOptions={initialBeneficiairesOptions}
          />
          <ExportStatistiques
            filters={activitesFilters}
            communesOptions={communesOptions}
            departementsOptions={departementsOptions}
            lieuxActiviteOptions={lieuxActiviteOptions}
            beneficiairesOptions={initialBeneficiairesOptions}
          />
        </div>
        <hr />
        <section className="fr-mb-6w">
          <StatistiquesGenerales {...mesStatistiquesProps} />
        </section>
        <section className="fr-mb-6w">
          <StatistiquesActivites {...mesStatistiquesProps} />
        </section>
        <section className="fr-mb-6w">
          <StatistiquesBeneficiaires {...mesStatistiquesProps} />
        </section>
        <section>
          <h2 className="fr-h5 fr-text-mention--grey fr-flex fr-align-items-center fr-flex-gap-2v">
            <img
              src="/images/services/conseillers-numerique-logo-small.svg"
              alt=""
            />
            Statistiques départementales France Numérique Ensemble
          </h2>
          <StatistiquesTerritoriales {...mesStatistiquesProps} />
        </section>
      </main>
    </CoopPageContainer>
  )
}
