import type { ReactNode } from 'react'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'
import { ActivitesDeCoordinationListe } from '../components/ActivitesDeCoordinationListe'
import type { ListeDesCoordinations } from '../presenters/liste-des-coordinations.presenter'

export const MesCoordinationsPage = ({
  sousTitre,
  barreDeFiltres,
  liste,
  filtre,
  pagination,
  lignesParPage,
}: {
  sousTitre?: string | undefined
  barreDeFiltres: ReactNode
  liste: ListeDesCoordinations
  filtre: boolean
  pagination: Readonly<Record<string, string>>
  lignesParPage: number
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
      {barreDeFiltres}
      <ActivitesDeCoordinationListe
        liste={liste}
        filtre={filtre}
        pagination={pagination}
        lignesParPage={lignesParPage}
      />
    </main>
  </CoopPageContainer>
)
