import CoopPageContainer from '@/app/coop/CoopPageContainer'
import { ChoisirLeLieuAFusionner } from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui/components/ChoisirLeLieuAFusionner'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'

export const FusionnerUnLieuPage = ({
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
          label: 'Lieux d’activité',
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
        Fusionner {nom} avec un autre lieu d’activité
      </AdministrationTitle>
      <ChoisirLeLieuAFusionner structureId={structureId} />
    </main>
  </CoopPageContainer>
)
