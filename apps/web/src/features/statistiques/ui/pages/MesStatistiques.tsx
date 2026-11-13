import type { SelectOption } from '@app/ui/components/Form/utils/options'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { getUserDepartement } from '@app/web/auth/getUserDepartement'
import type { SessionUser } from '@app/web/auth/sessionUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import Filters from '@app/web/features/statistiques/ui/filtres/Filters'
import { FilterTags } from '@app/web/features/statistiques/ui/filtres/FilterTags'
import type { ActivitesFilters } from '@app/web/features/statistiques/ui/filtres/parametres-de-la-barre'
import { contentId } from '@app/web/utils/skipLinks'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import {
  ExportStatistiques,
  ExportStatistiquesEnAttente,
} from '../export/ExportStatistiques'
import { ImpressionPreteProvider } from '../export/impression-prete'
import type { VocabulaireDeLaBarre } from '../filtres/vocabulaire-de-la-barre'
import { BlocEnAttente } from '../sections/BlocEnAttente'
import { StatistiquesImpact } from '../sections/StatistiquesImpact'
import { statistiquesPageTitle } from './titre-des-statistiques'

export type OptionsDeLaBarre = {
  activitesFilters: ActivitesFilters
  communesOptions: SelectOption[]
  departementsOptions: SelectOption[]
  lieuxActiviteOptions: SelectOption[]
  structuresEmployeusesOptions: ComponentProps<
    typeof Filters
  >['structuresEmployeusesOptions']
  tagsOptions: ComponentProps<typeof Filters>['tagsOptions']
  initialMediateursOptions: ComponentProps<
    typeof Filters
  >['initialMediateursOptions']
  initialBeneficiairesOptions: ComponentProps<
    typeof Filters
  >['initialBeneficiairesOptions']
  activiteSourceOptions: SelectOption[]
  activiteDates: { first: Date | undefined }
  vocabulaire: VocabulaireDeLaBarre
  filtreDeLieu: ReactNode
}

export const MesStatistiques = ({
  activitesFilters,
  communesOptions,
  departementsOptions,
  tagsOptions,
  initialMediateursOptions,
  initialBeneficiairesOptions,
  lieuxActiviteOptions,
  structuresEmployeusesOptions,
  activiteDates,
  activiteSourceOptions,
  vocabulaire,
  filtreDeLieu,
  user,
  hasCrasV1,
  accompagnementsCount,
  partage,
  impression,
  generale,
  activites,
  beneficiaires,
}: OptionsDeLaBarre & {
  user: SessionUser
  hasCrasV1: boolean
  accompagnementsCount: Promise<number>
  partage: ReactNode
  impression: ReactNode
  generale: ReactNode
  activites: ReactNode
  beneficiaires: ReactNode
}) => {
  return (
    <ImpressionPreteProvider key={JSON.stringify(activitesFilters)}>
      <CoopPageContainer size={56}>
        <CoopBreadcrumbs currentPage={statistiquesPageTitle(user)} />
        <SkipLinksPortal />
        {impression}
        <main className="fr-no-print" id={contentId}>
          <h1 className="fr-text-title--blue-france fr-mb-5v">
            {statistiquesPageTitle(user)}
          </h1>
          <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-mb-3w">
            <Filters
              defaultFilters={activitesFilters}
              vocabulaire={vocabulaire}
              filtreDeLieu={filtreDeLieu}
              structuresEmployeusesOptions={structuresEmployeusesOptions}
              tagsOptions={tagsOptions}
              initialMediateursOptions={initialMediateursOptions}
              initialBeneficiairesOptions={initialBeneficiairesOptions}
              beneficiairesFilter={false}
              minDate={activiteDates.first}
              isCoordinateur={user.coordinateur?.id != null}
              isMediateur={user.mediateur?.id != null}
              hasCrasV1={hasCrasV1}
            />
            <div className="fr-flex fr-flex-gap-2v">
              {partage}
              <BlocEnAttente attente={<ExportStatistiquesEnAttente />}>
                <ExportStatistiques
                  filters={activitesFilters}
                  communesOptions={communesOptions}
                  departementsOptions={departementsOptions}
                  lieuxActiviteOptions={lieuxActiviteOptions}
                  mediateursOptions={initialMediateursOptions}
                  beneficiairesOptions={[]}
                  tagsOptions={tagsOptions}
                  accompagnementsCount={accompagnementsCount}
                  activiteSourceOptions={activiteSourceOptions}
                  vocabulaire={vocabulaire}
                />
              </BlocEnAttente>
            </div>
          </div>
          <FilterTags
            filters={activitesFilters}
            communesOptions={communesOptions}
            departementsOptions={departementsOptions}
            lieuxActiviteOptions={lieuxActiviteOptions}
            structuresEmployeusesOptions={structuresEmployeusesOptions}
            mediateursOptions={initialMediateursOptions}
            beneficiairesOptions={[]}
            tagsOptions={tagsOptions}
            activiteSourceOptions={activiteSourceOptions}
            vocabulaire={vocabulaire}
          />
          {hasCrasV1 && (
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
          <section className="fr-mb-6w fr-mt-6v">{generale}</section>
          <section className="fr-mb-6w">{activites}</section>
          <section className="fr-mb-6w">{beneficiaires}</section>
          <section className="fr-mb-6w">
            <StatistiquesImpact
              codeDepartement={getUserDepartement(user)?.code}
            />
          </section>
        </main>
      </CoopPageContainer>
    </ImpressionPreteProvider>
  )
}
