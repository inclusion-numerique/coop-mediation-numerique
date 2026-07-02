import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { MergeWithStructure } from '@app/web/features/structures/use-cases/merge/components/MergeWithStructure'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'

export const MergeStructurePage = ({
  structureId,
  nom,
}: {
  structureId: string
  nom: string
}) => (
  <CoopPageContainer>
    <SkipLinksPortal />
    <AdministrationBreadcrumbs
      currentPage="Fusionner"
      parents={[
        {
          label: 'Structures',
          linkProps: { href: '/administration/lieux-activite' },
        },
        {
          label: nom,
          linkProps: {
            href: `/administration/lieux-activite/${structureId}/modifier`,
          },
        },
      ]}
    />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-git-merge-line">
        Fusionner {nom} avec une autre structure
      </AdministrationTitle>
      <MergeWithStructure structureId={structureId} />
    </main>
  </CoopPageContainer>
)
