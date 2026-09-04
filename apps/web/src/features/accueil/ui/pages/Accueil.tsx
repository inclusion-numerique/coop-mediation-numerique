import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import EquipeVide from '@app/web/equipe/EquipeVide'
import FormationContinueNouvelleFonctionnaliteCard from '@app/web/features/accueil/nouvelles-fonctionnalites/use-cases/formation-continue/components/FormationContinueNouvelleFonctionnaliteCard'
import RdvNouvelleFonctionnaliteCard from '@app/web/features/accueil/nouvelles-fonctionnalites/use-cases/rdv/components/RdvNouvelleFonctionnaliteCard'
import TagsNouvelleFonctionnaliteCard from '@app/web/features/accueil/nouvelles-fonctionnalites/use-cases/tags/components/TagsNouvelleFonctionnaliteCard'
import ActiviteDetailsModal from '@app/web/features/activites/use-cases/list/components/ActiviteDetailsModal/ActiviteDetailsModal'
import { ActivitesCoordination } from '@app/web/features/activites/use-cases/list/components/ActivitesCoordination'
import { DernieresActivites } from '@app/web/features/activites/use-cases/list/components/DernieresActivites'
import { RdvIntegrationErreurAlerte } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/ui/components/RdvIntegrationErreurAlerte'
import RdvsAccueil from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/ui/components/RdvsAccueil'
import { contentId } from '@app/web/utils/skipLinks'
import type { AccueilPageData } from '../../accueil-page-data.query'
import {
  ActionsRapides,
  InformationsCoop,
  OnboardingInfo,
  Support,
} from '../components'
import { Equipe } from '../components/Equipe'

export const Accueil = ({
  firstName,
  name,
  email,
  mediateurs,
  activites,
  activitesCoordinationByQuarter,
  hasSeenOnboarding,
  isMediateur,
  isCoordinateur,
  timezone,
  userId,
  widgetRdv,
  synchroniserRdvsAuChargement,
}: {
  userId: string
  firstName: string | null
  name: string | null
  hasSeenOnboarding: string | null
  email: string
  isMediateur: boolean
  isCoordinateur: boolean
  timezone: string
} & AccueilPageData) => (
  <CoopPageContainer size={56}>
    <SkipLinksPortal />
    <main id={contentId}>
      <h1 className="fr-text-title--blue-france fr-mt-12v fr-mb-0">
        👋 Bonjour {firstName || name || email}
      </h1>
      <RdvNouvelleFonctionnaliteCard />
      <FormationContinueNouvelleFonctionnaliteCard />
      <TagsNouvelleFonctionnaliteCard />
      {!isCoordinateur && (
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
            <EquipeVide withHeader />
          )}
        </section>
      )}

      <RdvsAccueil
        widget={widgetRdv}
        user={{ timezone }}
        synchroniserAuChargement={synchroniserRdvsAuChargement}
        alerte={<RdvIntegrationErreurAlerte />}
      />
      {isCoordinateur && (
        <>
          <section className="fr-my-6w">
            <ActivitesCoordination activites={activitesCoordinationByQuarter} />
          </section>
          <hr className="fr-separator-1px" />
        </>
      )}
      {!isCoordinateur && (
        <>
          <section className="fr-my-6w">
            <DernieresActivites activites={activites} />
          </section>
          <hr className="fr-separator-1px" />
        </>
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
