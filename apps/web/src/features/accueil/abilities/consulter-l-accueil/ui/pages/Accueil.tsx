import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import type { ReactNode } from 'react'
import type { Accueil as AccueilDuVisiteur } from '../../domain'
import { ActionsRapides } from '../components/ActionsRapides'
import { InformationsCoop } from '../components/InformationsCoop'
import { OnboardingInfo } from '../components/OnboardingInfo'
import { Support } from '../components/Support'

export const Accueil = ({
  accueil: { salutation, profil },
  equipe,
  rendezVous,
  activites,
}: {
  accueil: AccueilDuVisiteur
  equipe: ReactNode
  rendezVous: ReactNode
  activites: ReactNode
}) => (
  <CoopPageContainer size={56}>
    <SkipLinksPortal />
    <main id={contentId}>
      <h1 className="fr-text-title--blue-france fr-mt-12v fr-mb-0">
        👋 Bonjour {salutation}
      </h1>
      {profil._tag === 'Mediateur' && (
        <>
          {profil.bienvenue && <OnboardingInfo />}
          <section className="fr-my-12v">
            <ActionsRapides />
          </section>
        </>
      )}
      {profil._tag === 'Coordinateur' && (
        <section className="fr-my-12v">{equipe}</section>
      )}
      {rendezVous}
      <section className="fr-my-6w">{activites}</section>
      <hr className="fr-separator-1px" />
      <section className="fr-my-6w">
        <InformationsCoop />
      </section>
      <section className="fr-flex-xl fr-flex-gap-4v fr-background-alt--blue-france fr-p-4w fr-border-radius--16">
        <Support />
      </section>
    </main>
  </CoopPageContainer>
)
