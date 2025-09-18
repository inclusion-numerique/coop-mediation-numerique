import NouvelleFonctionnaliteCard from '../../../components/NouvelleFonctionnaliteCard'
import SnoozeNouvelleFonctionnaliteButton from '../../../components/SnoozeNouvelleFonctionnaliteButton'
import ConsolidationStatistiquesDecouvrirButton from './ConsolidationStatistiquesDecouvrirButton'

const consolidationStatistiquesFeatureId = 'consolidation-statistiques'

const ConsolidationStatistiquesNouvelleFonctionnaliteCard = () => (
  <NouvelleFonctionnaliteCard
    featureId={consolidationStatistiquesFeatureId}
    showFrom={new Date('2025-09-01')}
    showUntil={new Date('2026-01-01')}
    featureName={
      <>
        <span className="ri-chat-poll-fill ri-lg fr-mr-1w" aria-hidden />
        Nouveauté : Consolidation des statistiques
      </>
    }
    illustration={
      <img
        src="/images/fonctionnalites/consolidation-statistiques-logo.svg"
        alt=""
        style={{ width: 64, textAlign: 'center', margin: '0 auto' }}
      />
    }
    action={
      <div>
        <ConsolidationStatistiquesDecouvrirButton />
        <SnoozeNouvelleFonctionnaliteButton
          className="fr-ml-2v"
          featureId={consolidationStatistiquesFeatureId}
        />
      </div>
    }
  >
    <p className="fr-mb-0 fr-text--medium">
      Découvrez différentes évolutions apportés à vos statistiques et vos
      exports afin de valoriser au mieux votre activité.
    </p>
  </NouvelleFonctionnaliteCard>
)

export default ConsolidationStatistiquesNouvelleFonctionnaliteCard
