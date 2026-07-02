import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import MergeStructureAdministrative from '@app/web/features/structures/use-cases/merge/components/MergeStructureAdministrative'
import { MergeStructureAdministrativePreview } from '@app/web/features/structures/use-cases/merge/components/MergeStructureAdministrativePreview'
import ValiderFusionStructureAdministrative from '@app/web/features/structures/use-cases/merge/components/ValiderFusionStructureAdministrative'
import type { MergeStructureAdministrativeData } from '@app/web/features/structures/use-cases/merge/queries/getMergeStructureAdministrativePreviewPageData'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'

export const MergeStructureAdministrativePreviewPage = ({
  structureAdministrativeId,
  mergeData,
}: {
  structureAdministrativeId: string
  mergeData: MergeStructureAdministrativeData
}) => (
  <CoopPageContainer>
    <SkipLinksPortal />
    <AdministrationBreadcrumbs
      currentPage="Fusionner"
      parents={[
        {
          label: 'Structures employeuses',
          linkProps: { href: '/administration/structures-employeuses' },
        },
        {
          label: mergeData.mergeTarget.nom,
          linkProps: {
            href: `/administration/structures-employeuses/${structureAdministrativeId}`,
          },
        },
      ]}
    />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-git-merge-line">
        Fusionner {mergeData.mergeTarget.nom} avec une autre employeuse
      </AdministrationTitle>
      <MergeStructureAdministrative
        structure={{
          id: mergeData.mergeTarget.id,
          nom: mergeData.mergeTarget.nom,
        }}
      />
      <div className="fr-flex fr-flex-gap-6v fr-mb-6v fr-direction-lg-row fr-direction-column">
        <div className="fr-border-radius--8 fr-border fr-p-8v fr-width-full">
          <MergeStructureAdministrativePreview
            employeuse={mergeData.mergeSource}
          />
        </div>
        <span
          className="ri-arrow-right-line ri-2x fr-my-auto fr-hidden fr-unhidden-lg"
          aria-hidden
        />
        <span
          className="ri-arrow-down-line ri-2x fr-mx-auto fr-hidden-lg"
          aria-hidden
        />
        <div className="fr-border-radius--8 fr-border fr-p-8v fr-width-full">
          <MergeStructureAdministrativePreview
            employeuse={mergeData.mergeTarget}
            source={mergeData.mergeSource}
          />
        </div>
      </div>
      <ValiderFusionStructureAdministrative
        sourceStructure={{
          id: mergeData.mergeSource.id,
          nom: mergeData.mergeSource.nom,
        }}
        targetStructure={{
          id: mergeData.mergeTarget.id,
          nom: mergeData.mergeTarget.nom,
        }}
      />
    </main>
  </CoopPageContainer>
)
