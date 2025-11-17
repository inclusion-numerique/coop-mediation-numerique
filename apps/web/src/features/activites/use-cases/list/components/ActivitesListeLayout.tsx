import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import type { PropsWithChildren } from 'react'
import ActiviteDetailsModal from './ActiviteDetailsModal/ActiviteDetailsModal'
import MesActivitesVueSegmentedControl from './MesActivitesVueSegmentedControl'

const ActivitesListeLayout = ({
  href,
  children,
  vue,
  subtitle,
  empty,
}: PropsWithChildren<{
  href: string
  vue: 'liste' | 'tableau'
  subtitle?: string
  empty?: boolean
}>) => (
  <CoopPageContainer size={49}>
    <SkipLinksPortal />
    <CoopBreadcrumbs currentPage="Mes activités" />
    <main id={contentId}>
      <div className="fr-mb-5v fr-width-full fr-flex fr-justify-content-space-between fr-align-items-center">
        <div>
          <h1 className="fr-text-title--blue-france fr-mb-0">Mes activités</h1>
          {subtitle && (
            <span className="fr-mb-0 fr-text--xs fr-text--uppercase fr-text--bold fr-text-mention--grey">
              {subtitle}
            </span>
          )}
        </div>
        {!empty && (
          <MesActivitesVueSegmentedControl current={vue} href={href} />
        )}
      </div>
      {children}
    </main>
    <ActiviteDetailsModal />
  </CoopPageContainer>
)

export default ActivitesListeLayout
