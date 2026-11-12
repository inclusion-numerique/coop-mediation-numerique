import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import type { ReactNode } from 'react'
import { DetailDeLActiviteModale } from '../../../../ui/detail/DetailDeLActiviteModale'
import { ChoixDeLaVue } from '../components/ChoixDeLaVue'

export const MesActivitesPage = ({
  vue,
  sousTitre,
  vide = false,
  saisieDuStatutDesRendezVous,
  children,
}: {
  vue: 'liste' | 'tableau'
  sousTitre?: string
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
