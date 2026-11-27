import type { ReactNode } from 'react'
import { hrefDeModificationDuLieu } from '@/features/lieux-activite/ui/presenters/href-du-lieu.presenter'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import {
  AdministrationBreadcrumbs,
  AdministrationTitle,
  CoopPageContainer,
} from '@/libraries/ui/components'
import type { FusionApercue } from '../../domain'
import { ApercuDeLaFusion } from '../components/ApercuDeLaFusion'
import { nomAffiche } from '../presenters/nom-affiche.presenter'

export const ApercuDeLaFusionPage = ({
  structureId,
  mergeData,
  choixDuLieu,
  validation,
}: {
  structureId: string
  mergeData: FusionApercue
  choixDuLieu: ReactNode
  validation: ReactNode
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
      {choixDuLieu}
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
      {validation}
    </main>
  </CoopPageContainer>
)
