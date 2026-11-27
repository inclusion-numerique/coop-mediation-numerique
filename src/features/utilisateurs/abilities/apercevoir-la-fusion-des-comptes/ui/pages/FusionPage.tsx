import type { ReactNode } from 'react'
import { hrefDeLUtilisateur } from '@/features/utilisateurs/ui/presenters/liens.presenter'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import {
  AdministrationBreadcrumbs,
  AdministrationTitle,
  CoopPageContainer,
} from '@/libraries/ui/components'
import type { ApercuDeFusion } from '../../domain'
import { ApercuDuCompte } from '../components/ApercuDuCompte'

export const FusionPage = ({
  cible,
  apercu,
  choix,
  validation,
}: {
  cible: { readonly id: string; readonly nom: string }
  apercu: ApercuDeFusion | null
  choix: ReactNode
  validation: ReactNode
}) => (
  <CoopPageContainer>
    <SkipLinksPortal />
    <AdministrationBreadcrumbs
      currentPage="Fusionner"
      parents={[
        {
          label: 'Utilisateurs',
          linkProps: { href: '/administration/utilisateurs' },
        },
        {
          label: cible.nom,
          linkProps: { href: hrefDeLUtilisateur(cible.id) },
        },
      ]}
    />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-git-merge-line">
        Fusionner {cible.nom} avec un autre utilisateur
      </AdministrationTitle>
      {choix}
      {apercu !== null && (
        <>
          <div className="fr-flex fr-flex-gap-6v fr-mb-6v fr-direction-lg-row fr-direction-column">
            <div className="fr-border-radius--8 fr-border fr-p-8v fr-width-full">
              <ApercuDuCompte
                compte={apercu.source}
                communs={apercu.communs}
                source={null}
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
              <ApercuDuCompte
                compte={apercu.cible}
                communs={apercu.communs}
                source={apercu.source.contenu}
              />
            </div>
          </div>
          {validation}
        </>
      )}
    </main>
  </CoopPageContainer>
)
