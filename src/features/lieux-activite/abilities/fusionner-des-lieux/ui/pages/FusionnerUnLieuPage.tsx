import { ChoisirLeLieuAFusionner } from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui/components/ChoisirLeLieuAFusionner'
import { hrefDeModificationDuLieu } from '@/features/lieux-activite/ui/presenters/href-du-lieu.presenter'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'

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
            href: hrefDeModificationDuLieu(structureId),
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
