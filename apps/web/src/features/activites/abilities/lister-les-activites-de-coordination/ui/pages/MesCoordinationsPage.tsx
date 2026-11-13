import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import type { ReactNode } from 'react'
import type { FiltreActif } from '../../../../ui/filtres-actifs-des-coordinations'
import { ActivitesDeCoordinationListe } from '../components/ActivitesDeCoordinationListe'
import { FiltreDePeriode } from '../components/FiltreDePeriode'
import { FiltreDeTags } from '../components/FiltreDeTags'
import { FiltreDeType } from '../components/FiltreDeType'
import { FiltresActifs } from '../components/FiltresActifs'
import type { ListeDesCoordinations } from '../liste-des-coordinations.presenter'
import type { OptionsDeFiltrePresentees } from '../options-de-filtre.presenter'

export const MesCoordinationsPage = ({
  sousTitre,
  options,
  filtresActifs,
  liste,
  filtre,
  pagination,
  exporter,
}: {
  sousTitre?: string
  options: OptionsDeFiltrePresentees
  filtresActifs: readonly FiltreActif[]
  liste: ListeDesCoordinations
  filtre: boolean
  pagination: Readonly<Record<string, string>>
  exporter: ReactNode
}) => (
  <CoopPageContainer size={56}>
    <SkipLinksPortal />
    <CoopBreadcrumbs currentPage="Mes activités" />
    <main id={contentId}>
      <div className="fr-mb-5v fr-width-full fr-flex fr-justify-content-space-between fr-align-items-center">
        <div>
          <h1 className="fr-text-title--blue-france fr-mb-0">Mes activités</h1>
          {sousTitre !== undefined && (
            <span className="fr-mb-0 fr-text--xs fr-text--uppercase fr-text--bold fr-text-mention--grey">
              {sousTitre}
            </span>
          )}
        </div>
      </div>
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-2v fr-mb-6v">
        <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
          <FiltreDePeriode minDate={options.debut} maxDate={options.fin} />
          <FiltreDeType />
          <FiltreDeTags tagOptions={[...options.tags]} />
        </div>
        {exporter}
      </div>
      <FiltresActifs
        ignoreParams={['page', 'lignes']}
        filters={filtresActifs}
      />
      <ActivitesDeCoordinationListe
        liste={liste}
        filtre={filtre}
        pagination={pagination}
      />
    </main>
  </CoopPageContainer>
)
