import { ChoisirLeLieuAFusionner } from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui/components/ChoisirLeLieuAFusionner'
import { hrefDeModificationDuLieu } from '@/features/lieux-activite/ui/presenters/href-du-lieu.presenter'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import {
  AdministrationBreadcrumbs,
  AdministrationTitle,
  CoopPageContainer,
} from '@/libraries/ui/components'

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
