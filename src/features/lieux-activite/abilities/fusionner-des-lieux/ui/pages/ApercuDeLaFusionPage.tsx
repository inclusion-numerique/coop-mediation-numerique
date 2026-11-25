import type { FusionApercue } from '@/features/lieux-activite/abilities/fusionner-des-lieux/domain'
import { ApercuDeLaFusion } from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui/components/ApercuDeLaFusion'
import { ChoisirLeLieuAFusionner } from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui/components/ChoisirLeLieuAFusionner'
import ValiderLaFusion from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui/components/ValiderLaFusion'
import { hrefDeModificationDuLieu } from '@/features/lieux-activite/ui/presenters/href-du-lieu.presenter'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { toTitleCase } from '@/libraries/texte'
import {
  AdministrationBreadcrumbs,
  AdministrationTitle,
  CoopPageContainer,
} from '@/libraries/ui/components'
import { nomAffiche } from '../presenters/nom-affiche.presenter'

export const ApercuDeLaFusionPage = ({
  structureId,
  mergeData,
}: {
  structureId: string
  mergeData: FusionApercue
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
          label: nomAffiche(mergeData.mergeTarget.nom),
          linkProps: {
            href: hrefDeModificationDuLieu(structureId),
          },
        },
      ]}
    />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-git-merge-line">
        Fusionner {nomAffiche(mergeData.mergeTarget.nom)} avec un autre lieu
        d’activité
      </AdministrationTitle>
      <ChoisirLeLieuAFusionner
        structureId={structureId}
        defaultMergeStructure={{
          id: mergeData.mergeSource.id,
          nom: nomAffiche(mergeData.mergeSource.nom),
          adresse: toTitleCase(mergeData.mergeSource.adresse?.voie ?? '', {
            noUpper: true,
          }),
          commune: toTitleCase(mergeData.mergeSource.adresse?.commune ?? ''),
          codePostal: mergeData.mergeSource.adresse?.code_postal ?? '',
        }}
      />
      <div className="fr-flex fr-flex-gap-6v fr-mb-6v fr-direction-lg-row fr-direction-column">
        <div className="fr-border-radius--8 fr-border fr-p-8v fr-width-full">
          <ApercuDeLaFusion
            common={mergeData.mergeCommon}
            merge={mergeData.mergeSource}
          />
        </div>
        <span
          className="ri-arrow-right-line fr-icon--lg fr-my-auto fr-hidden fr-unhidden-lg"
          aria-hidden
        />
        <span
          className="ri-arrow-down-line fr-icon--lg fr-mx-auto fr-hidden-lg"
          aria-hidden
        />
        <div className="fr-border-radius--8 fr-border fr-p-8v fr-width-full">
          <ApercuDeLaFusion
            common={mergeData.mergeCommon}
            merge={mergeData.mergeTarget}
            source={mergeData.mergeSource}
          />
        </div>
      </div>
      <ValiderLaFusion
        sourceStructure={mergeData.mergeSource}
        targetStructure={mergeData.mergeTarget}
      />
    </main>
  </CoopPageContainer>
)
