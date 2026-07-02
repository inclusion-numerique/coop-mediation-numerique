import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { MergeLieuInclusionPreview } from '@app/web/features/structures/use-cases/merge/components/MergeLieuInclusionPreview'
import { MergeWithLieuInclusion } from '@app/web/features/structures/use-cases/merge/components/MergeWithLieuInclusion'
import ValiderFusionLieuInclusion from '@app/web/features/structures/use-cases/merge/components/ValiderFusionLieuInclusion'
import type { MergeLieuInclusionSourceAndTargetData } from '@app/web/features/structures/use-cases/merge/queries/getMergeLieuInclusionPreviewPageData'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'

export const MergeLieuInclusionPreviewPage = ({
  structureId,
  mergeData,
}: {
  structureId: string
  mergeData: NonNullable<MergeLieuInclusionSourceAndTargetData>
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
          label: mergeData.mergeTarget.nom,
          linkProps: {
            href: `/administration/lieux-activite/${structureId}/modifier`,
          },
        },
      ]}
    />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-git-merge-line">
        Fusionner {mergeData.mergeTarget.nom} avec un autre lieu d’activité
      </AdministrationTitle>
      <MergeWithLieuInclusion
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
          <MergeLieuInclusionPreview
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
          <MergeLieuInclusionPreview
            common={mergeData.mergeCommon}
            merge={mergeData.mergeTarget}
            source={mergeData.mergeSource}
          />
        </div>
      </div>
      <ValiderFusionLieuInclusion
        sourceStructure={mergeData.mergeSource}
        targetStructure={mergeData.mergeTarget}
      />
    </main>
  </CoopPageContainer>
)
