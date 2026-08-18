import NouvelleFonctionnaliteCard from '../../../components/NouvelleFonctionnaliteCard'
import SnoozeNouvelleFonctionnaliteButton from '../../../components/SnoozeNouvelleFonctionnaliteButton'
import RdvDecouvrirButton from './RdvDecouvrirButton'

const rdvFeatureId = 'rdv'

const RdvNouvelleFonctionnaliteCard = () => (
  <NouvelleFonctionnaliteCard
    featureId={rdvFeatureId}
    showFrom={new Date('2025-12-01')}
    showUntil={new Date('2026-02-01')}
    featureName="Nouveauté&nbsp;: Intégration RDV Service public"
    illustration={
      <img
        src="/images/fonctionnalites/rdv.svg"
        alt=""
        style={{ width: '100%' }}
      />
    }
    action={
      <div>
        <RdvDecouvrirButton />
        <SnoozeNouvelleFonctionnaliteButton
          className="fr-ml-2v"
          featureId={rdvFeatureId}
        />
      </div>
    }
  >
    <p className="fr-mb-0 fr-text--medium">
      Planifiez des rendez-vous avec vos bénéficiaires et retrouvez-les dans
      leurs historiques d’accompagnements.
    </p>
  </NouvelleFonctionnaliteCard>
)

export default RdvNouvelleFonctionnaliteCard
