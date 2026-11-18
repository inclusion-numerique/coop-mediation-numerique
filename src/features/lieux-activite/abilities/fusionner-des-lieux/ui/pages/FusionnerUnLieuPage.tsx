import CoopPageContainer from '@/app/coop/CoopPageContainer'
import SkipLinksPortal from '@/components/SkipLinksPortal'
import { ChoisirLeLieuAFusionner } from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui/components/ChoisirLeLieuAFusionner'
import AdministrationBreadcrumbs from '@/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libs/ui/administration/AdministrationTitle'
import { contentId } from '@/utils/skipLinks'

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
