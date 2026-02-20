import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { MergeStructurePreview } from '@app/web/features/structures/use-cases/merge/components/MergeStructurePreview'
import { MergeWithStructure } from '@app/web/features/structures/use-cases/merge/components/MergeWithStructure'
import ValiderFusionStructure from '@app/web/features/structures/use-cases/merge/components/ValiderFusionStructure'
import type { MergeStructureSourceAndTargetData } from '@app/web/features/structures/use-cases/merge/queries/getMergeStructurePreviewPageData'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'

export const MergeStructurePreviewPage = ({
  structureId,
  mergeData,
}: {
  structureId: string
  mergeData: NonNullable<MergeStructureSourceAndTargetData>
}) => (
  <CoopPageContainer>
    <SkipLinksPortal />
    <AdministrationBreadcrumbs
      currentPage="Fusionner"
      parents={[
        {
          label: 'Structures',
          linkProps: { href: '/administration/structures' },
        },
        {
          label: mergeData.mergeTarget.nom,
          linkProps: {
            href: `/administration/structures/${structureId}/modifier`,
          },
        },
      ]}
    />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-git-merge-line">
        Fusionner {mergeData.mergeTarget.nom} avec une autre structure
      </AdministrationTitle>
      <MergeWithStructure
        structureId={structureId}
        defaultMergeStructure={{
          id: mergeData.mergeSource.id,
          nom: mergeData.mergeSource.nom,
          adresse: mergeData.mergeSource.adresse,
          commune: mergeData.mergeSource.commune,
          codePostal: mergeData.mergeSource.codePostal,
        }}
      />
      <div className="fr-flex fr-flex-gap-6v fr-mb-6v fr-direction-lg-row fr-direction-column">
        <div className="fr-border-radius--8 fr-border fr-p-8v fr-width-full">
          <MergeStructurePreview
            common={mergeData.mergeCommon}
            merge={mergeData.mergeSource}
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
          <MergeStructurePreview
            common={mergeData.mergeCommon}
            merge={mergeData.mergeTarget}
            source={mergeData.mergeSource}
          />
        </div>
      </div>
      <ValiderFusionStructure
        sourceStructure={mergeData.mergeSource}
        targetStructure={mergeData.mergeTarget}
      />
    </main>
  </CoopPageContainer>
)
