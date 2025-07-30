import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { contentId } from '@app/web/utils/skipLinks'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'

export const AdministrationTagsPage = () => {
  return (
    <CoopPageContainer>
      <SkipLinksPortal />
      <AdministrationBreadcrumbs
        parents={[
          {
            label: 'Fonctionnalités',
            linkProps: { href: `/administration/fonctionnalites` },
          },
        ]}
        currentPage="Tags"
      />
      <main id={contentId}>
        <AdministrationTitle icon="ri-calendar-check-line">
          Tags
        </AdministrationTitle>
      </main>
    </CoopPageContainer>
  )
}
