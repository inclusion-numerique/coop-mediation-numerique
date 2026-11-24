import type { ReactNode } from 'react'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'
import { DetailDeLActiviteModale } from '../../../../ui/components/DetailDeLActiviteModale'
import { ChoixDeLaVue } from './ChoixDeLaVue'

export const MesActivitesPage = ({
  vue,
  sousTitre,
  vide = false,
  saisieDuStatutDesRendezVous,
  children,
}: {
  vue: 'liste' | 'tableau'
  sousTitre?: string | undefined
  vide?: boolean
  saisieDuStatutDesRendezVous: ReactNode
  children: ReactNode
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
        {!vide && <ChoixDeLaVue courante={vue} href="/coop/mes-activites" />}
      </div>
      {children}
    </main>
    <DetailDeLActiviteModale />
    {saisieDuStatutDesRendezVous}
  </CoopPageContainer>
)
