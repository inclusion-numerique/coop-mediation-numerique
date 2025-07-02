import { CommunicationConum } from '@app/web/app/coop/(sidemenu-layout)/(accueil-coop)/_components/CommunicationConum'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { EquipeVide } from '@app/web/app/coop/EquipeVide'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import ActiviteDetailsModal from '@app/web/features/activites/use-cases/list/components/ActiviteDetailsModal/ActiviteDetailsModal'
import { DernieresActivites } from '@app/web/features/activites/use-cases/list/components/DernieresActivites'
import CafeIaNouvelleFonctionnaliteCard from '@app/web/features/dashboard/nouvelles-fonctionnalites/use-cases/cafe-ia/components/CafeIaNouvelleFonctionnaliteCard'
import { contentId } from '@app/web/utils/skipLinks'
import React from 'react'
import {
  ActionsRapides,
  InformationsCoop,
  OnboardingInfo,
  Support,
} from './_components'
import { Equipe } from './_components/Equipe'
import Rdvs from './_components/Rdvs'
import { AccueilPageData } from './getAccueilPageDataFor'

export const Accueil = ({
  firstName,
  name,
  email,
  mediateurs,
  activites,
  hasSeenOnboarding,
  isMediateur,
  isCoordinateur,
  isCoordinateurCoNum,
  isCoNum,
  timezone,
  rdvs,
}: {
  firstName: string | null
  name: string | null
  hasSeenOnboarding: string | null
  email: string
  isMediateur: boolean
  isCoordinateur: boolean
  isCoordinateurCoNum: boolean
  isCoNum: boolean
  timezone: string
} & AccueilPageData) => (
  <CoopPageContainer size={794}>
    <SkipLinksPortal />
    <main id={contentId}>
      <h1 className="fr-text-title--blue-france fr-mt-10v">
        👋 Bonjour {firstName || name || email}
      </h1>
      <div className="fr-my-12v">
        <CafeIaNouvelleFonctionnaliteCard />
      </div>
      {isMediateur && (
        <>
          <OnboardingInfo hasSeenOnboarding={hasSeenOnboarding} />
          <section className="fr-my-12v">
            <ActionsRapides />
          </section>
        </>
      )}
      {isCoordinateur && (
        <section className="fr-my-12v">
          {mediateurs.total > 0 ? (
            <Equipe mediateurs={mediateurs} />
          ) : (
            <EquipeVide />
          )}
        </section>
      )}
      {rdvs && (
        <section className="fr-my-6w">
          <Rdvs rdvs={rdvs} user={{ timezone }} />
        </section>
      )}
      {isMediateur && (
        <>
          <section className="fr-my-6w">
            <DernieresActivites activites={activites} />
          </section>
          <hr className="fr-separator-1px" />
        </>
      )}
      {(isCoNum || isCoordinateurCoNum) && (
        <section className="fr-my-6w">
          <CommunicationConum />
        </section>
      )}
      <section className="fr-my-6w">
        <InformationsCoop />
      </section>
      <section className="fr-flex-xl fr-flex-gap-4v fr-background-alt--blue-france fr-p-4w fr-border-radius--16">
        <Support />
      </section>
    </main>
    <ActiviteDetailsModal />
  </CoopPageContainer>
)
