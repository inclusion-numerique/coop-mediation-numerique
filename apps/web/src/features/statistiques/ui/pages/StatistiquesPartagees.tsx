import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import Filters from '@app/web/features/statistiques/ui/filtres/Filters'
import { FilterTags } from '@app/web/features/statistiques/ui/filtres/FilterTags'
import { contentId } from '@app/web/utils/skipLinks'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ExportStatistiques,
  ExportStatistiquesEnAttente,
} from '../export/ExportStatistiques'
import { ImpressionPreteProvider } from '../export/impression-prete'
import { BlocEnAttente } from '../sections/BlocEnAttente'
import type { OptionsDeLaBarre } from './MesStatistiques'

export const StatistiquesPartagees = ({
  shareId,
  username,
  activitesFilters,
  communesOptions,
  departementsOptions,
  tagsOptions,
  initialMediateursOptions,
  initialBeneficiairesOptions,
  lieuxActiviteOptions,
  structuresEmployeusesOptions,
  activiteSourceOptions,
  vocabulaire,
  filtreDeLieu,
  activiteDates,
  hasCrasV1,
  accompagnementsCount,
  impression,
  generale,
  activites,
  beneficiaires,
}: OptionsDeLaBarre & {
  shareId: string
  username: string
  hasCrasV1: boolean
  accompagnementsCount: Promise<number>
  impression: ReactNode
  generale: ReactNode
  activites: ReactNode
  beneficiaires: ReactNode
}) => {
  return (
    <ImpressionPreteProvider key={JSON.stringify(activitesFilters)}>
      <SkipLinksPortal />
      {impression}
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
                href="https://docs.numerique.gouv.fr/docs/ef6cbecf-1091-467d-8039-73dfec1d3acf/"
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
            vocabulaire={vocabulaire}
            filtreDeLieu={filtreDeLieu}
            structuresEmployeusesOptions={structuresEmployeusesOptions}
            tagsOptions={tagsOptions}
            initialMediateursOptions={initialMediateursOptions}
            initialBeneficiairesOptions={initialBeneficiairesOptions}
            beneficiairesFilter={false}
            minDate={activiteDates.first}
            isCoordinateur={false}
            isMediateur={true}
            hasCrasV1={hasCrasV1}
          />
          <div className="fr-flex fr-flex-gap-2v">
            <BlocEnAttente
              attente={
                <ExportStatistiquesEnAttente title="Export des statistiques" />
              }
            >
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
                exportListAccompagnements={false}
                publicExportId={shareId}
                title="Export des statistiques"
                emptyFilterMessage="Vous n’avez pas appliqué de filtre, l’intégralité des statistiques sera exportée."
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
      </main>
    </ImpressionPreteProvider>
  )
}
